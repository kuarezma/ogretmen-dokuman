import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './AuthModal.css'; 

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'word',
    category: 'Yazılı'
  });
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    try {
      let fileUrl = '';
      if (file) {
         const fileExt = file.name.split('.').pop();
         const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
         
         const { error: uploadError } = await supabase.storage
           .from('documents')
           .upload(fileName, file);

         if (uploadError) throw uploadError;

         const { data: publicUrlData } = supabase.storage
           .from('documents')
           .getPublicUrl(fileName);
           
         fileUrl = publicUrlData.publicUrl;
      }

      // Supabase veritabanına ekle
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          title: formData.title,
          topic: formData.description, 
          type: formData.type,
          category: formData.category,
          uploaded_by: currentUser.username,
          date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }),
          file_url: fileUrl
        }])
        .select();

      if (error) throw error;

      setIsUploading(false);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        onUploadSuccess(data ? data[0] : null);
        onClose();
        setFormData({ title: '', description: '', type: 'word', category: 'Yazılı' });
        setFile(null);
      }, 1500);

    } catch (err) {
      console.error("Yükleme hatası:", err);
      alert("Belge yüklenirken bir hata oluştu.");
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content glass-panel" style={{ maxWidth: '550px' }}>
        <button className="modal-close" onClick={onClose} disabled={isUploading}>
          <X size={24} />
        </button>
        
        {success ? (
          <div className="success-state" style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle size={64} color="var(--color-success)" style={{ marginBottom: '1rem', margin: '0 auto' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Başarıyla Yüklendi!</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>Belgeniz bulut sistemine eklendi ve tüm öğretmenlerin erişimine açıldı.</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>Belge Yükle</h2>
              <p>Topluluğa katkıda bulunmak için materyallerinizi paylaşın.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <FileText className="input-icon" size={20} />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Belge Başlığı (Örn: 9. Sınıf Fizik Testi)" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required 
                />
              </div>

              <div className="input-group" style={{ display: 'flex', gap: '1rem' }}>
                <select 
                  className="input-field" 
                  style={{ paddingLeft: '1.25rem' }}
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="word">Word Belgesi</option>
                  <option value="excel">Excel Klasörü</option>
                  <option value="pdf">PDF Dosyası</option>
                </select>

                <select 
                  className="input-field" 
                  style={{ paddingLeft: '1.25rem' }}
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Yazılı">Yazılı Soruları</option>
                  <option value="Test">Deneme / Test</option>
                  <option value="Yıllık Plan">Yıllık Planlar</option>
                  <option value="Proje">Proje / Etkinlik</option>
                </select>
              </div>

              <div className="input-group">
                <textarea 
                  className="input-field" 
                  placeholder="Belge hakkında kısa bir açıklama..." 
                  rows="3"
                  style={{ paddingLeft: '1.25rem', resize: 'vertical' }}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="upload-dropzone" 
                   style={{
                     position: 'relative',
                     border: '2px dashed #cbd5e1',
                     borderRadius: 'var(--radius-lg)',
                     padding: '2rem',
                     textAlign: 'center',
                     cursor: 'pointer',
                     display: 'block',
                     backgroundColor: file ? 'rgba(56, 189, 248, 0.1)' : 'rgba(248, 250, 252, 0.5)',
                     zIndex: 10
                   }}>
                <input 
                  id="file-upload"
                  type="file" 
                  onChange={handleFileChange} 
                  style={{ 
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%', 
                    opacity: 0, cursor: 'pointer', zIndex: 20 
                  }} 
                  required 
                />
                <UploadCloud size={32} color={file ? "var(--color-primary)" : "var(--color-text-muted)"} style={{ margin: '0 auto 0.5rem', position: 'relative', zIndex: 10 }} />
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', position: 'relative', zIndex: 10 }}>
                  {file ? <strong>Seçilen Dosya: {file.name}</strong> : <span>Dosyanızı seçmek için <strong>tıklayın</strong></span>}
                </p>
              </div>

              <button type="submit" className="btn btn-primary auth-btn" disabled={isUploading}>
                {isUploading ? 'Buluta Kaydediliyor...' : 'Tüm Türkiye İle Paylaş'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadModal;
