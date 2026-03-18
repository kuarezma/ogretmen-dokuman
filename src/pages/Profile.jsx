import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, FileText, Trash2, Calendar, Download, Eye, Heart, Star, TrendingUp, MessageSquare } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const [myDocuments, setMyDocuments] = useState([]);
  const [favoriteDocuments, setFavoriteDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [userStats, setUserStats] = useState({ totalDownloads: 0, totalLikes: 0, totalComments: 0 });
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    if (currentUser) {
      fetchMyDocuments();
      fetchUserAvatar();
      fetchFavorites();
      fetchUserStats();
    }
  }, []);

  const fetchUserStats = async () => {
    if (!currentUser?.username) return;
    try {
      const { data: docs } = await supabase
        .from('documents')
        .select('download_count, likes_count')
        .eq('uploaded_by', currentUser.username);
      
      let totalDownloads = 0;
      let totalLikes = 0;
      
      if (docs) {
        docs.forEach(doc => {
          totalDownloads += doc.download_count || 0;
          totalLikes += doc.likes_count || 0;
        });
      }

      const { count: commentCount } = await supabase
        .from('document_comments')
        .select('id', { count: 'exact', head: true })
        .eq('user_name', currentUser.username);

      setUserStats({
        totalDownloads,
        totalLikes,
        totalComments: commentCount || 0
      });
    } catch (err) {
      console.error("Kullanıcı istatistikleri çekilemedi:", err);
    }
  };

  const fetchUserAvatar = async () => {
    try {
      // Sunucudan güncel kullanıcı verisini çek (getSession() önbellek okur, getUser() her zaman güncel!)
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
        return;
      }
      
      // Sonra users tablosundan dene
      if (!currentUser?.email) return;
      const { data } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('email', currentUser.email)
        .maybeSingle();
        
      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    } catch (err) {
      console.error("Avatar çekme başarısız:", err);
    }
  };

  const fetchFavorites = async () => {
    if (!currentUser?.email) return;
    try {
      const { data, error } = await supabase
        .from('document_favorites')
        .select('documents(*)')
        .eq('user_email', currentUser.email)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setFavoriteDocuments(data.map(f => f.documents).filter(Boolean));
      }
    } catch (err) {
      console.error("Favoriler yüklenemedi:", err);
    }
  };

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

  const handleAvatarUpload = async (event) => {
    try {
      setIsUploadingAvatar(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      
      // YÖNTEM 1: Supabase Storage kullan
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      
      let publicUrl = null;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        publicUrl = urlData?.publicUrl;
      } else {
        console.warn("Storage upload başarısız, base64 yöntemi deneniyor:", uploadError.message);
        
        // YÖNTEM 2 (yedek): Resmi base64'e çevir ve metadata olarak kaydet
        const reader = new FileReader();
        publicUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }
      
      if (!publicUrl) throw new Error("Resim URL'si alınamadı.");
      
      // Supabase Auth kullanıcı metadata'sına kaydet (RLS gerektirmez!)
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      
      if (authUpdateError) {
        console.warn("Auth metadata güncellenemedi:", authUpdateError.message);
        // users tablosunu da dene
        await supabase.from('users').update({ avatar_url: publicUrl }).eq('email', currentUser.email);
      }
      
      // Ekranda göster
      setAvatarUrl(publicUrl);
      alert('Profil resminiz başarıyla güncellendi! 🎉');
      
    } catch (error) {
      console.error("Resim yükleme hatası:", error);
      alert(`Hata: ${error.message}`);
    } finally {
      setIsUploadingAvatar(false);
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
        <div className="avatar-section">
          <div className="profile-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profil Resmi" className="avatar-image" />
            ) : (
              <User size={48} color="var(--color-primary)" />
            )}
          </div>
          
          <label className={`avatar-upload-btn ${isUploadingAvatar ? 'disabled' : ''}`}>
            {isUploadingAvatar ? 'Yükleniyor...' : 'Resim Değiştir'}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarUpload} 
              disabled={isUploadingAvatar}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div className="profile-info">
          <h1>{currentUser.username}</h1>
          <p>{currentUser.email}</p>
        </div>
        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-value">{myDocuments.length}</span>
            <span className="stat-label">Belge</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{userStats.totalDownloads}</span>
            <span className="stat-label">İndirme</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{userStats.totalLikes}</span>
            <span className="stat-label">Beğeni</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{userStats.totalComments}</span>
            <span className="stat-label">Yorum</span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        {/* ⭐ FAVORİLERİM BÖLÜMÜ */}
        {favoriteDocuments.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <div className="section-header">
              <h2><Star size={24} style={{ color: '#f59e0b' }} /> Favorilerim</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{favoriteDocuments.length} belge</span>
            </div>
            <div className="my-docs-grid">
              {favoriteDocuments.map((doc) => (
                <div key={doc.id} className="doc-card glass-panel profile-doc-card" style={{ borderLeft: '3px solid #f59e0b' }}>
                  <div className="doc-card-header">
                    <div className="doc-meta-top">
                      {getFormatBadge(doc.type)}
                      <span className="category-badge">{doc.category}</span>
                    </div>
                  </div>
                  <div className="doc-card-body">
                    <h3 className="doc-title">{doc.title}</h3>
                    <div className="doc-info">
                      <div className="info-item">
                        <Calendar size={14} />
                        <span>{new Date(doc.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="profile-doc-actions">
                    {doc.file_url && (
                      <button className="btn btn-outline btn-sm" onClick={() => window.open(doc.file_url, '_blank')}>
                        <Download size={16} /> İndir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
