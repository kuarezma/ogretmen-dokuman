import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle } from 'lucide-react';
import './AuthModal.css'; // Auth Modal css'ini tekrar kullanmak için

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'word',
    category: 'Yazılı'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsUploading(true);

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const newDocument = {
      id: Date.now().toString(),
      ...formData,
      uploader: currentUser.username,
      date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }),
      downloads: 0
    };

    // Simulate upload delay
    setTimeout(() => {
      const docs = JSON.parse(localStorage.getItem('documents') || '[]');
      docs.unshift(newDocument);
      localStorage.setItem('documents', JSON.stringify(docs));
      
      setIsUploading(false);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        onUploadSuccess(newDocument);
        onClose();
        setFormData({ title: '', description: '', type: 'word', category: 'Yazılı' });
      }, 1500);
    }, 1200);
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
            <p style={{ color: 'var(--color-text-muted)' }}>Belgeniz sisteme eklendi ve paylaşıma açıldı.</p>
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

              <div className="upload-dropzone" style={{
                border: '2px dashed #cbd5e1',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: 'rgba(248, 250, 252, 0.5)'
              }}>
                <UploadCloud size={32} color="var(--color-text-muted)" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  Dosyanızı buraya sürükleyin veya <strong>seçmek için tıklayın</strong>
                </p>
                <input type="file" style={{ display: 'none' }} required />
              </div>

              <button type="submit" className="btn btn-primary auth-btn" disabled={isUploading}>
                {isUploading ? 'Yükleniyor...' : 'Paylaş'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadModal;
