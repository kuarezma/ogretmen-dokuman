require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const bcrypt = require('bcryptjs');
 const db = require('./database');
 const supabase = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Dosya yükleme: uploads klasörüne, orijinal isim + tarih
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + (file.originalname || 'document').replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, safe);
  }
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Basit oturum: cookie'de userId
function getUserId(req) {
  const sid = req.cookies?.session;
  if (!sid) return null;
  const row = db.prepare('SELECT user_id FROM sessions WHERE id = ?').get(sid);
  return row ? row.user_id : null;
}

// --- API: Kayıt
app.post('/api/register', (req, res) => {
  const { username, password, email } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, message: 'Kullanıcı adı ve şifre gerekli.' });
  }
  const hash = bcrypt.hashSync(password, 10);
  try {
    db.prepare('INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)').run(username, hash, email || null);
    res.json({ ok: true, message: 'Kayıt başarılı. Giriş yapabilirsiniz.' });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE')
      return res.status(400).json({ ok: false, message: 'Bu kullanıcı adı zaten kullanılıyor.' });
    res.status(500).json({ ok: false, message: 'Kayıt sırasında hata.' });
  }
});

// --- API: Giriş
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = db.prepare('SELECT id, password_hash FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ ok: false, message: 'Kullanıcı adı veya şifre hatalı.' });
  }
  const sessionId = require('crypto').randomBytes(24).toString('hex');
  db.prepare('INSERT INTO sessions (id, user_id) VALUES (?, ?)').run(sessionId, user.id);
  res.cookie('session', sessionId, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
  res.json({ ok: true, message: 'Giriş başarılı.', username });
});

// --- API: Çıkış
app.post('/api/logout', (req, res) => {
  const sid = req.cookies?.session;
  if (sid) db.prepare('DELETE FROM sessions WHERE id = ?').run(sid);
  res.clearCookie('session', { path: '/' });
  res.json({ ok: true });
});

// --- API: Mevcut kullanıcı
app.get('/api/me', (req, res) => {
  const uid = getUserId(req);
  if (!uid) return res.json({ user: null });
  const user = db.prepare('SELECT id, username, email FROM users WHERE id = ?').get(uid);
  res.json({ user: user || null });
});

// --- API: Belge yükle
app.post('/api/documents', (req, res) => {
  const uid = getUserId(req);
  if (!uid) return res.status(401).json({ ok: false, message: 'Giriş yapmalısınız.' });
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ ok: false, message: 'Dosya yükleme hatası.' });
    const file = req.file;
    if (!file) return res.status(400).json({ ok: false, message: 'Dosya seçiniz.' });
    const { title, description, file_type, category } = req.body || {};
    const ext = (file.originalname || '').split('.').pop().toLowerCase();
    const allowed = { word: ['doc', 'docx'], excel: ['xls', 'xlsx'], pdf: ['pdf'] };
    const type = file_type || (allowed.pdf.includes(ext) ? 'pdf' : allowed.word.includes(ext) ? 'word' : allowed.excel.includes(ext) ? 'excel' : 'other');
    try {
      const result = db.prepare(`
        INSERT INTO documents (user_id, title, description, file_type, category, file_name, file_path, file_size)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(uid, title || file.originalname, description || '', type, category || 'diger', file.originalname, file.filename, file.size);
      res.json({ ok: true, id: result.lastInsertRowid, message: 'Belge yüklendi.' });
    } catch (e) {
      res.status(500).json({ ok: false, message: 'Kayıt hatası.' });
    }
  });
});

// --- API: Belge ara (tip + metin)
app.get('/api/documents', (req, res) => {
  const { type, q, category } = req.query;
  let sql = `
    SELECT d.id, d.title, d.description, d.file_type, d.category, d.file_name, d.file_size, d.created_at, u.username
    FROM documents d
    JOIN users u ON d.user_id = u.id
    WHERE 1=1
  `;
  const params = [];
  if (type && type !== 'tumu') {
    sql += ' AND d.file_type = ?';
    params.push(type);
  }
  if (category && category !== 'tumu') {
    sql += ' AND d.category = ?';
    params.push(category);
  }
  if (q && q.trim()) {
    sql += ' AND (d.title LIKE ? OR d.description LIKE ?)';
    const like = '%' + q.trim() + '%';
    params.push(like, like);
  }
  sql += ' ORDER BY d.created_at DESC';
  const rows = db.prepare(sql).all(...params);
  res.json({ documents: rows });
});

// --- API: Supabase test endpoint
app.get('/api/supabase-test', async (req, res) => {
  try {
    const { data, error } = await supabase.from('documents').select('id, title').limit(1);
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, data });
  } catch (e) {
    res.status(500).json({ ok: false, message: 'Supabase test failed', error: e?.message });
  }
});

// --- API: İndir (dosya adı ile güvenli)
app.get('/api/documents/:id/download', (req, res) => {
  const row = db.prepare('SELECT file_path, file_name FROM documents WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).send('Belge bulunamadı.');
  const filePath = path.join(UPLOADS_DIR, row.file_path);
  res.download(filePath, row.file_name);
});

// SPA: tüm sayfalar index'e yönlendirilsin (tek sayfa uygulaması için)
app.get('/giris', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/kayit', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/yukle', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/belgeler', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log('Öğretmen Döküman: http://localhost:' + PORT));
