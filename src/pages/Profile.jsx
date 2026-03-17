import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, FileText, Trash2, Calendar, Download, Eye, Heart } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const [myDocuments, setMyDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    if (currentUser) {
      fetchMyDocuments();
    }
  }, []);

  const fetchMyDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('uploaded_by', currentUser.username)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyDocuments(data || []);
    } catch (err) {
      console.error("Belgeleriniz yüklenirken hata oluştu:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (docId, fileUrl) => {
    if (!window.confirm("Bu belgeyi kalıcı olarak silmek istediğinize emin misiniz?")) return;

    try {
      // 1. Storage'dan dosyayı sil (Eğer bir dosya URL'si varsa ve supabase linkiyse)
      if (fileUrl && fileUrl.includes('supabase.co')) {
        const fileName = fileUrl.split('/').pop();
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('documents')
            .remove([fileName]);
            
          if (storageError) console.error("Storage silme hatası:", storageError);
        }
      }

      // 2. Database'den kaydı sil
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId);

      if (dbError) throw dbError;

      // 3. UI'ı güncelle
      setMyDocuments(prev => prev.filter(doc => doc.id !== docId));
      alert("Belge başarıyla silindi.");
      
    } catch (err) {
      console.error("Silme işlemi başarısız:", err);
      alert("Silme işlemi sırasında bir hata oluştu.");
    }
  };

  const getFormatBadge = (type) => {
    return (
      <span className={`format-badge format-${type.toLowerCase()}`}>
        {type.toUpperCase()}
      </span>
    );
  };

  if (!currentUser) {
    return (
      <div className="profile-container" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Profilinizi görmek için giriş yapmalısınız.</h2>
      </div>
    );
  }

  return (
    <div className="profile-container animate-fade-in">
      <div className="profile-header glass-panel">
        <div className="profile-avatar">
          <User size={48} color="var(--color-primary)" />
        </div>
        <div className="profile-info">
          <h1>{currentUser.username}</h1>
          <p>{currentUser.email}</p>
        </div>
        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-value">{myDocuments.length}</span>
            <span className="stat-label">Yüklenen Belge</span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="section-header">
          <h2><FileText size={24} /> Benim Yüklediğim Belgeler</h2>
        </div>

        {isLoading ? (
          <div className="loading-state">Belgeleriniz yükleniyor...</div>
        ) : myDocuments.length > 0 ? (
          <div className="my-docs-grid">
            {myDocuments.map((doc) => (
              <div key={doc.id} className="doc-card glass-panel profile-doc-card">
                <div className="doc-card-header">
                   <div className="doc-meta-top">
                    {getFormatBadge(doc.type)}
                    <span className="category-badge">{doc.category}</span>
                  </div>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(doc.id, doc.file_url)}
                    title="Bu belgeyi sil"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="doc-card-body">
                  <h3 className="doc-title">{doc.title}</h3>
                  <div className="doc-info" style={{ marginTop: '1rem', borderTop: 'none', paddingTop: 0 }}>
                    <div className="info-item">
                      <Calendar size={14} />
                      <span>{doc.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state glass-panel">
            <FileText size={48} color="var(--color-text-muted)" style={{ marginBottom: '1rem' }} />
            <h3>Henüz hiç belge yüklemediniz</h3>
            <p>Topluluğa katkıda bulunmak için materyallerinizi paylaşmaya başlayın.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
