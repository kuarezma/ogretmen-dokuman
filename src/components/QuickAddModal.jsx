import React, { useState } from 'react';
import { X, Upload, FileText, Link as LinkIcon, Check, UploadCloud } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';

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
  "Yazılı Soruları", "Deneme / Test", "Yıllık Plan", "Günlük Plan",
  "Proje / Performans", "Zümre Tutanakları", "Etkinlik / Çalışma Kağıdı",
  "Sunum (Slayt)", "Diğer"
];

const QuickAddModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    grade: '',
    lesson: '',
    category: '',
    file_url: '',
    type: 'pdf'
  });
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
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.title || !formData.grade || !formData.lesson || !formData.category) {
      setError('Başlık, sınıf, ders ve kategori alanları zorunludur.');
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

      if (file) {
        toast.loading('Dosya yükleniyor...', { id: 'upload' });
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
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

      const currentUser = JSON.parse(localStorage.getItem('currentUser'));

      const { data, error: insertError } = await supabase
        .from('documents')
        .insert([{
          title: formData.title,
          topic: formData.topic || formData.title,
          grade: formData.grade,
          lesson: formData.lesson,
          category: formData.category,
          file_url: fileUrl,
          uploaded_by: currentUser?.username || 'Anonim',
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
        setFormData({
          title: '', topic: '', grade: '', lesson: '', category: '', file_url: ''
        });
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
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: 'var(--shadow-xl)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={20} color="white" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-text)' }}>
              Belge Ekle
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-danger)',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--color-text)'
            }}>
              Başlık *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Örn: 5. Sınıf Matematik Deneme Sınavı"
              className="input-field"
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--color-text)'
            }}>
              Sınıf *
            </label>
            <select
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className="input-field"
              required
              style={{ cursor: 'pointer' }}
            >
              <option value="">Seçiniz</option>
              {GRADE_OPTIONS.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--color-text)'
            }}>
              Ders *
            </label>
            <select
              name="lesson"
              value={formData.lesson}
              onChange={handleChange}
              className="input-field"
              required
              style={{ cursor: 'pointer' }}
            >
              <option value="">Seçiniz</option>
              {LESSON_OPTIONS.map(lesson => (
                <option key={lesson} value={lesson}>{lesson}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--color-text)'
            }}>
              Kategori *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              required
              style={{ cursor: 'pointer' }}
            >
              <option value="">Seçiniz</option>
              {CATEGORY_OPTIONS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--color-text)'
            }}>
              Dosya Türü
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input-field"
              style={{ cursor: 'pointer' }}
            >
              <option value="pdf">PDF</option>
              <option value="word">Word</option>
              <option value="excel">Excel</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--color-text)'
            }}>
              Dosya Bağlantısı (URL)
            </label>
            <div style={{ position: 'relative' }}>
              <LinkIcon size={16} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)'
              }} />
              <input
                type="url"
                name="file_url"
                value={formData.file_url}
                onChange={handleChange}
                placeholder="https://drive.google.com/..."
                className="input-field"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--color-text)'
            }}>
              veya Dosya Yükle
            </label>
            <div 
              style={{
                border: '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                textAlign: 'center',
                background: file ? 'rgba(16, 185, 129, 0.05)' : 'var(--color-surface-hover)',
                borderColor: file ? 'var(--color-success)' : 'var(--color-border)',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              <UploadCloud size={28} color={file ? 'var(--color-success)' : 'var(--color-text-muted)'} style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ color: file ? 'var(--color-success)' : 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                {file ? (
                  <strong>Seçilen: {file.name}</strong>
                ) : (
                  'Dosya seç (PDF, Word, Excel)'
                )}
              </p>
              <label 
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  background: 'var(--color-primary)',
                  color: 'white',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Dosya Seç
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || success}
            className="btn btn-primary"
            style={{
              width: '100%',
              opacity: isSubmitting || success ? 0.7 : 1,
              cursor: isSubmitting || success ? 'not-allowed' : 'pointer'
            }}
          >
            {success ? (
              <>
                <Check size={18} /> Eklendi!
              </>
            ) : isSubmitting ? (
              <>
                <Upload size={18} style={{ animation: 'spin 1s linear infinite' }} /> Ekleniyor...
              </>
            ) : (
              <>
                <Upload size={18} /> Belge Ekle
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default QuickAddModal;
