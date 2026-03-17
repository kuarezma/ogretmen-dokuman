import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, Download, User as UserIcon, Calendar, Eye, Heart } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './DocumentCard.css';

const DocumentCard = ({ document }) => {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    fetchLikes();
  }, [document.id]);

  const fetchLikes = async () => {
    try {
      // Toplam beğeni sayısını çek
      const { count: totalLikes, error: countError } = await supabase
        .from('document_likes')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', document.id);
        
      if (!countError) {
        setLikesCount(totalLikes || 0);
      }

      // Kullanıcının beğenip beğenmediğini kontrol et
      if (currentUser) {
        const { data: userLike } = await supabase
          .from('document_likes')
          .select('id')
          .eq('document_id', document.id)
          .eq('user_name', currentUser.username)
          .single();
          
        setIsLiked(!!userLike);
      }
    } catch (err) {
      console.error("Beğeni verileri çekilemedi", err);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      alert("Beğenmek için giriş yapmalısınız.");
      return;
    }
    
    setIsLiking(true);

    try {
      if (isLiked) {
        // Zaten beğenilmişse, beğeniyi kaldır 
        const { error } = await supabase
          .from('document_likes')
          .delete()
          .match({ document_id: document.id, user_name: currentUser.username });
          
        if (!error) {
          setIsLiked(false);
          setLikesCount(prev => Math.max(0, prev - 1));
        }
      } else {
        // Beğenilmemişse, yeni beğeni at
        const { error } = await supabase
          .from('document_likes')
          .insert([{ document_id: document.id, user_name: currentUser.username }]);
          
        if (!error) {
          setIsLiked(true);
          setLikesCount(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error("Beğeni işlemi başarısız", err);
    } finally {
      setIsLiking(false);
    }
  };

  const getIconColor = (type) => {
    switch (type.toLowerCase()) {
      case 'word': return 'var(--color-doc-word)';
      case 'excel': return 'var(--color-doc-excel)';
      case 'pdf': return 'var(--color-doc-pdf)';
      default: return 'var(--color-primary)';
    }
  };

  const getFormatBadge = (type) => {
    return (
      <span className={`format-badge format-${type.toLowerCase()}`}>
        {type.toUpperCase()}
      </span>
    );
  };

  const handlePreview = () => {
    if (!document.file_url) {
      alert("Bu belgenin dosyası henüz yüklenmemiş.");
      return;
    }
    
    // PDF ise direkt açılır, Word/Excel ise Office Online Viewer ile açılır
    if (document.type.toLowerCase() === 'pdf') {
       window.open(document.file_url, '_blank');
    } else {
       const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(document.file_url)}`;
       window.open(viewerUrl, '_blank');
    }
  };

  const handleDownload = () => {
    if (!document.file_url) {
      alert("Bu belgenin dosyası henüz yüklenmemiş.");
      return;
    }
    window.open(document.file_url, '_blank');
  };

  return (
    <div className="doc-card glass-panel animate-fade-in delay-100">
      <div className="doc-card-header">
        <div className="doc-icon" style={{ color: getIconColor(document.type) }}>
          <FileText size={32} />
        </div>
        <div className="doc-meta-top">
          {getFormatBadge(document.type)}
          <span className="category-badge">{document.category}</span>
        </div>
      </div>
      
      <div className="doc-card-body">
        <h3 className="doc-title">{document.title}</h3>
        <p className="doc-desc">{document.description}</p>
      </div>
      
      <div className="doc-card-footer">
        <div className="doc-info">
          <div className="info-item">
            <UserIcon size={14} />
            <span>{document.uploader}</span>
          </div>
          <div className="info-item">
            <Calendar size={14} />
            <span>{document.date}</span>
          </div>
        </div>
        
        <div className="doc-actions-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            className={`btn-icon like-btn ${isLiked ? 'liked' : ''}`} 
            onClick={handleLike}
            disabled={isLiking}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem', 
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isLiked ? 'var(--color-danger)' : 'var(--color-text-muted)',
              transition: 'all 0.2s ease',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <Heart 
              size={20} 
              fill={isLiked ? 'currentColor' : 'none'} 
              className={isLiking ? 'animate-pulse' : ''} 
            />
            <span style={{ fontWeight: '500' }}>{likesCount}</span>
          </button>

          <div className="doc-actions" style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-outline btn-sm dl-btn" onClick={handlePreview} style={{ padding: '0.5rem' }}>
              <Eye size={16} /> Önizle
            </button>
            <button className="btn btn-primary btn-sm dl-btn" onClick={handleDownload} style={{ padding: '0.5rem' }}>
              <Download size={16} /> İndir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
