import React, { useState } from 'react';
import { X, Upload, FileText, Link as LinkIcon, Check, UploadCloud, Key } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';
import './QuickAddModal.css';

const GRADE_OPTIONS = [
  "Okul Öncesi", "1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf",
  "5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf",
  "9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf", "Genel / Ortak"
];

const LESSON_OPTIONS = [
  "Türkçe", "Matematik", "Fen Bilimleri", "Sosyal Bilgiler", "İngilizce",
  "Din Kültürü", "Hayat Bilgisi", "Müzik", "Görsel Sanatlar", "Beden Eğitimi",
  "Bilişim Teknolojileri", "Teknoloji ve Tasarım", "Fizik", "Kimya", "Biyoloji",
  "Tarih", "Coğrafya", "T.C. İnkılap Tarihi", "Türk Dili ve Edebiyatı",
  "Felsefe", "Almanca", "Meslek Dersleri", "Okuma Yazma Öğreniyorum",
  "İnsan Hakları", "Seçmeli Dersler", "Oyun ve Etkinlik", "Boyama",
  "Masal / Hikaye", "Rehberlik", "Sınıf Öğretmenliği", "ŞÖK Toplantıları",
  "Veli Toplantıları", "Klavuzlar", "Yönetmelikler", "Diğer"
];

const CATEGORY_OPTIONS = [
  "Yazılı Soruları", "Deneme Sınavı", "Yaprak Test", "Yıllık Plan", "Günlük Plan",
  "Proje / Performans", "Zümre Tutanakları", "Etkinlik / Çalışma Kağıdı",
  "Sunum (Slayt)", "Diğer"
];
const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.csv';

const INITIAL_FORM_DATA = {
  title: '',
  topic: '',
  grade: '',
  lesson: '',
  category: '',
  file_url: '',
  type: 'pdf',
  answer_key_text: '',
  solution_url: ''
};

const inferFileType = (fileName = '') => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(extension)) return 'word';
  if (['xls', 'xlsx', 'csv'].includes(extension)) return 'excel';
  return 'pdf';
};

const QuickAddModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFormData(prev => ({ ...prev, type: inferFileType(selectedFile.name) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.title || !formData.grade || !formData.lesson || !formData.category) {
      setError('Lütfen tüm zorunlu alanları doldurun.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.file_url && !file) {
      setError('Lütfen bir dosya bağlantısı ekleyin veya dosya yükleyin.');
      setIsSubmitting(false);
      return;
    }

    try {
      let fileUrl = formData.file_url;
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        throw new Error('Belge yüklemek için giriş yapmalısınız.');
      }

      const storedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      let username = storedUser?.username;

      if (!username && authUser.email) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profileError) throw profileError;
        username = profile?.username || authUser.email.split('@')[0];
      }

      if (file) {
        toast.loading('Dosya yükleniyor...', { id: 'upload' });
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) {
          toast.error('Dosya yüklenemedi: ' + uploadError.message, { id: 'upload' });
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);
        
        fileUrl = publicUrlData.publicUrl;
        toast.success('Dosya yüklendi!', { id: 'upload' });
      }

      const resolvedType = file ? inferFileType(file.name) : formData.type;
      const uploaderName = username || authUser.email?.split('@')[0] || 'Kullanıcı';

      const { data, error: insertError } = await supabase
        .from('documents')
        .insert([{
          title: formData.title,
          topic: formData.topic || formData.title,
          type: resolvedType,
          grade: formData.grade,
          lesson: formData.lesson,
          category: formData.category,
          file_url: fileUrl,
          answer_key_text: formData.answer_key_text || null,
          solution_url: formData.solution_url || null,
          uploaded_by: uploaderName,
          date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }),
          created_at: new Date().toISOString(),
          download_count: 0,
          likes_count: 0
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccess(true);
      toast.success('Belge başarıyla eklendi!');
        setTimeout(() => {
          onSuccess?.(data);
          onClose();
          setFormData(INITIAL_FORM_DATA);
          setFile(null);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Kayıt hatası:', err);
      setError(err.message || 'Bir hata oluştu.');
      toast.error(err.message || 'Bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title-container">
            <div className="header-icon-box">
              <FileText size={22} color="white" />
            </div>
            <h2>Belge Ekle</h2>
          </div>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="form-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="form-group">
            <label>Belge Başlığı *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Örn: 8. Sınıf Fen Bilimleri LGS Deneme"
              className="input-field"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Sınıf *</label>
              <select name="grade" value={formData.grade} onChange={handleChange} className="input-field" required>
                <option value="">Seçiniz</option>
                {GRADE_OPTIONS.map(grade => <option key={grade} value={grade}>{grade}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Kategori *</label>
              <select name="category" value={formData.category} onChange={handleChange} className="input-field" required>
                <option value="">Seçiniz</option>
                {CATEGORY_OPTIONS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Ders *</label>
            <select name="lesson" value={formData.lesson} onChange={handleChange} className="input-field" required>
              <option value="">Seçiniz</option>
              {LESSON_OPTIONS.map(lesson => <option key={lesson} value={lesson}>{lesson}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Dosya Bağlantısı (URL)</label>
            <div className="input-with-icon">
              <LinkIcon size={16} className="input-icon" />
              <input
                type="url"
                name="file_url"
                value={formData.file_url}
                onChange={handleChange}
                placeholder="Google Drive, Dropbox vb. linki"
                className="input-field has-icon"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Veya Dosya Yükle</label>
            <div className={`file-upload-zone ${file ? 'active' : ''}`}>
              <UploadCloud size={32} className={`upload-icon ${file ? 'success' : ''}`} />
              <div className="file-info">
                {file ? <strong>{file.name}</strong> : 'Dosyayı buraya sürükleyin veya seçin'}
              </div>
              <label className="select-file-label">
                Dosya Seç
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  accept={ACCEPTED_FILE_TYPES}
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Açıklama (Opsiyonel)</label>
            <textarea
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="Belge içeriği hakkında kısa bilgi..."
              className="input-field"
              rows={3}
              style={{ minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label>
              <Key size={14} style={{ verticalAlign: 'middle', marginRight: '0.35rem', opacity: 0.85 }} />
              Cevap Anahtarı (Opsiyonel)
            </label>
            <textarea
              name="answer_key_text"
              value={formData.answer_key_text}
              onChange={handleChange}
              placeholder="Örn: 1-A, 2-B, 3-C veya kısa cevap metni"
              className="input-field"
              rows={3}
              style={{ minHeight: '72px', resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label>Çözüm PDF (Drive veya doğrudan link, opsiyonel)</label>
            <div className="input-with-icon">
              <LinkIcon size={16} className="input-icon" />
              <input
                type="url"
                name="solution_url"
                value={formData.solution_url}
                onChange={handleChange}
                placeholder="https://drive.google.com/..."
                className="input-field has-icon"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || success}
            className={`btn btn-primary submit-button ${isSubmitting ? 'loading' : ''}`}
          >
            {success ? (
              <><Check size={18} /> Başarıyla Eklendi!</>
            ) : isSubmitting ? (
              <><UploadCloud size={18} className="spinner-icon" /> Yükleniyor...</>
            ) : (
              <><Upload size={18} /> Belgeyi Paylaş</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickAddModal;
