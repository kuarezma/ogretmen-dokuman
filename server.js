require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const supabase = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + (file.originalname || 'document').replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, safe);
  }
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

async function getUserFromSession(sid) {
  if (!sid) return null;
  const { data } = await supabase.from('sessions').select('user_id, users(id, username, email)').eq('id', sid).single();
  return data;
}

// --- API: Kayıt
app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, message: 'Kullanıcı adı ve şifre gerekli.' });
  }
  const hash = bcrypt.hashSync(password, 10);
  try {
    const { error } = await supabase.from('users').insert({ username, password_hash: hash, email: email || null });
    if (error) {
      if (error.code === '23505') return res.status(400).json({ ok: false, message: 'Bu kullanıcı adı zaten kullanılıyor.' });
      return res.status(500).json({ ok: false, message: error.message });
    }
    res.json({ ok: true, message: 'Kayıt başarılı. Giriş yapabilirsiniz.' });
  } catch {
    res.status(500).json({ ok: false, message: 'Kayıt sırasında hata.' });
  }
});

// --- API: Giriş
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  const { data: users, error } = await supabase.from('users').select('id, password_hash').eq('username', username);
  if (error || !users || users.length === 0) {
    return res.status(401).json({ ok: false, message: 'Kullanıcı adı veya şifre hatalı.' });
  }
  const user = users[0];
  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ ok: false, message: 'Kullanıcı adı veya şifre hatalı.' });
  }
  const sessionId = require('crypto').randomBytes(24).toString('hex');
  await supabase.from('sessions').insert({ id: sessionId, user_id: user.id });
  res.cookie('session', sessionId, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
  res.json({ ok: true, message: 'Giriş başarılı.', username });
});

// --- API: Çıkış
app.post('/api/logout', async (req, res) => {
  const sid = req.cookies?.session;
  if (sid) await supabase.from('sessions').delete().eq('id', sid);
  res.clearCookie('session', { path: '/' });
  res.json({ ok: true });
});

// --- API: Mevcut kullanıcı
app.get('/api/me', async (req, res) => {
  const sid = req.cookies?.session;
  if (!sid) return res.json({ user: null });
  const session = await getUserFromSession(sid);
  if (!session) return res.json({ user: null });
  res.json({ user: { id: session.users.id, username: session.users.username, email: session.users.email } });
});

// --- API: Belge yükle
app.post('/api/documents', async (req, res) => {
  const sid = req.cookies?.session;
  if (!sid) return res.status(401).json({ ok: false, message: 'Giriş yapmalısınız.' });
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ ok: false, message: 'Dosya yükleme hatası.' });
    const file = req.file;
    if (!file) return res.status(400).json({ ok: false, message: 'Dosya seçiniz.' });
    const { title, description, file_type, category, answer_key_text, solution_url } = req.body || {};
    const ext = (file.originalname || '').split('.').pop().toLowerCase();
    const allowed = { word: ['doc', 'docx'], excel: ['xls', 'xlsx'], pdf: ['pdf'] };
    const type = file_type || (allowed.pdf.includes(ext) ? 'pdf' : allowed.word.includes(ext) ? 'word' : allowed.excel.includes(ext) ? 'excel' : 'other');
    try {
      const session = await getUserFromSession(sid);
      if (!session) return res.status(401).json({ ok: false, message: 'Oturum bulunamadı.' });
      const { data, error } = await supabase.from('documents').insert({
        user_id: session.users.id,
        title: title || file.originalname,
        description: description || '',
        file_type: type,
        category: category || 'diger',
        answer_key_text: answer_key_text || null,
        solution_url: solution_url || null,
        file_name: file.originalname,
        file_path: file.filename,
        file_size: file.size
      }).select();
      if (error) return res.status(500).json({ ok: false, message: error.message });
      res.json({ ok: true, id: data[0].id, message: 'Belge yüklendi.' });
    } catch {
      res.status(500).json({ ok: false, message: 'Kayıt hatası.' });
    }
  });
});

// --- API: Belge ara
app.get('/api/documents', async (req, res) => {
  const { type, q, category } = req.query;
  let query = supabase.from('documents').select('id, title, description, file_type, category, file_name, file_size, answer_key_text, solution_url, created_at, username:users(username)');
  if (type && type !== 'tumu') query = query.eq('file_type', type);
  if (category && category !== 'tumu') query = query.eq('category', category);
  if (q && q.trim()) {
    query = query.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%`);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(500).json({ documents: [], error: error.message });
  const docs = (data || []).map(d => ({ ...d, username: d.username?.username }));
  res.json({ documents: docs });
});

// --- API: Supabase test
app.get('/api/supabase-test', async (req, res) => {
  try {
    const { data, error } = await supabase.from('documents').select('id, title').limit(1);
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, data });
  } catch (e) {
    res.status(500).json({ ok: false, message: 'Supabase test failed', error: e?.message });
  }
});

// --- API: İndir
app.get('/api/documents/:id/download', async (req, res) => {
  const { data, error } = await supabase.from('documents').select('file_path, file_name').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).send('Belge bulunamadı.');
  const filePath = path.join(UPLOADS_DIR, data.file_path);
  res.download(filePath, data.file_name);
});

app.get('/giris', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/kayit', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/yukle', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/belgeler', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

if (require.main === module) {
  app.listen(PORT, () => console.log('Öğretmen Döküman: http://localhost:' + PORT));
}
module.exports = app;
