import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, Download, User as UserIcon, Calendar, Eye, Heart, MessageSquare } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './DocumentCard.css';

const DocumentCard = ({ document }) => {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [uploaderAvatar, setUploaderAvatar] = useState(null);
  
  // Yorum State'leri
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    fetchLikes();
    fetchComments();
    fetchUploaderAvatar();
  }, [document.id]);

  const fetchUploaderAvatar = async () => {
    try {
      if (!document.uploader) return;
      const { data, error } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('username', document.uploader)
        .single();
        
      if (!error && data?.avatar_url) {
        setUploaderAvatar(data.avatar_url);
      }
    } catch (err) {
      console.error("Uploader avatar çekilemedi", err);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('document_comments')
        .select('*')
        .eq('document_id', document.id)
        .order('created_at', { ascending: true });
        
      if (!error && data) {
        // Yorum sahiplerinin avatarlarını da eklemek için bir harita oluştur (Performans için)
        const usernames = [...new Set(data.map(c => c.user_name))];
        const { data: usersData } = await supabase
          .from('users')
          .select('username, avatar_url')
          .in('username', usernames);
          
        const avatarMap = {};
        if (usersData) {
          usersData.forEach(user => {
            avatarMap[user.username] = user.avatar_url;
          });
        }
        
        const commentsWithAvatars = data.map(comment => ({
          ...comment,
          user_avatar: avatarMap[comment.user_name] || null
        }));
        
        setComments(commentsWithAvatars);
      }
    } catch (err) {
      console.error("Yorumlar çekilemedi", err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Yorum yapmak için giriş yapmalısınız.");
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('document_comments')
        .insert([{ 
          document_id: document.id, 
          user_name: currentUser.username,
          content: newComment.trim()
        }])
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        setComments([...comments, data[0]]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Yorum ekleme başarısız:", err);
      alert("Yorum eklenirken hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="doc-meta-top" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {getFormatBadge(document.type)}
          
          {document.grade && document.grade !== 'Genel' && (
            <span className="category-badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--color-primary)'}}>
              {document.grade}
            </span>
          )}
          
          {document.lesson && document.lesson !== 'Genel' && (
            <span className="category-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#d97706'}}>
              {document.lesson}
            </span>
          )}

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
            {uploaderAvatar ? (
              <img 
                src={uploaderAvatar} 
                alt={document.uploader} 
                style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              <UserIcon size={14} />
            )}
            <span>{document.uploader}</span>
          </div>
          <div className="info-item">
            <Calendar size={14} />
            <span>{document.date}</span>
          </div>
        </div>
        
        <div className="doc-actions-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
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

          <button 
            className="btn-icon comment-toggle-btn" 
            onClick={() => setShowComments(!showComments)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem', 
              background: showComments ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: showComments ? 'var(--color-primary)' : 'var(--color-text-muted)',
              transition: 'all 0.2s ease',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <MessageSquare size={20} />
            <span style={{ fontWeight: '500' }}>{comments.length}</span>
          </button>

          <div className="doc-actions" style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
            <button className="btn btn-outline btn-sm dl-btn" onClick={handlePreview} style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
              <Eye size={16} /> Önizle
            </button>
            <button className="btn btn-primary btn-sm dl-btn" onClick={handleDownload} style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
              <Download size={16} /> İndir
            </button>
          </div>
        </div>
      </div>
      
      {/* Yorumlar Bölümü (Açılır Kapanır) */}
      {showComments && (
        <div className="comments-section" style={{ 
          borderTop: '1px solid var(--color-border)', 
          padding: '1rem',
          backgroundColor: 'rgba(249, 250, 251, 0.5)'
        }}>
          
          {/* Yorum Listesi */}
          {comments.length > 0 ? (
            <div className="comments-list" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {comments.map((comment) => (
                <div key={comment.id} className="comment-item" style={{ 
                  background: 'white', 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', alignItems: 'center' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {comment.user_avatar ? (
                        <img 
                          src={comment.user_avatar} 
                          alt={comment.user_name} 
                          style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                      ) : (
                         <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserIcon size={12} color="var(--color-primary)" />
                         </div>
                      )}
                      <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--color-primary)' }}>{comment.user_name}</span>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text)' }}>{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Henüz yorum yapılmamış. İlk yorumu siz yapın!
            </div>
          )}

          {/* Yorum Ekleme Formu */}
          {currentUser ? (
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Bir yorum yazın..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ 
                  flex: 1, 
                  padding: '0.5rem 0.75rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--color-border)',
                  outline: 'none'
                }}
              />
              <button 
                type="submit" 
                className="btn btn-primary btn-sm"
                disabled={isSubmitting || !newComment.trim()}
              >
                {isSubmitting ? '...' : 'Gönder'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              Yorum yapmak için giriş yapmalısınız.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
