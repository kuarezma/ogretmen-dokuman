import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Users, MessageCircle, Clock, CheckCircle, Search, Edit3, Eye, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './Forum.css';

const FORUM_CATEGORIES = [
  "Tümü",
  "Mevzuat & İdare",
  "Zümre Odaları",
  "Materyal Paylaşımı",
  "Soru - Cevap",
  "Serbest Kürsü"
];

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Tümü");
  
  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Mevzuat & İdare");
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('forum_posts').select('*').order('created_at', { ascending: false });
      
      if (activeCategory !== "Tümü") {
        query = query.eq('category', activeCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.warn("Forum tablosu henüz oluşturulmamış:", error.message);
        setPosts([]);
      } else {
        setPosts(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Konu açmak için giriş yapmalısınız.');
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Lütfen başlık ve içerik girin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert([{
          user_name: currentUser.username,
          title: newTitle.trim(),
          content: newContent.trim(),
          category: newCategory,
          views: 0,
          replies: 0
        }])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Eğer aktif kategori uyuyorsa listeye ekle
        if (activeCategory === "Tümü" || activeCategory === newCategory) {
          setPosts([data[0], ...posts]);
        }
        setShowForm(false);
        setNewTitle("");
        setNewContent("");
        toast.success("Konu başarıyla açıldı!");
      }
    } catch (error) {
      toast.error("Konu kaydedilirken hata oluştu. Veritabanı (forum_posts) ayarlanmamış olabilir.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadgeColor = (cat) => {
    switch (cat) {
      case "Mevzuat & İdare": return "#ef4444";
      case "Zümre Odaları": return "#3b82f6";
      case "Materyal Paylaşımı": return "#10b981";
      case "Soru - Cevap": return "#f59e0b";
      default: return "#8b5cf6";
    }
  };

  return (
    <div className="forum-page container animate-fade-in">
      <div className="forum-hero glass-panel">
        <div className="forum-hero-content">
          <h2><Users size={32} color="var(--color-primary)" /> Öğretmenler Odası</h2>
          <p>Meslektaşlarınızla bilgi alışverişinde bulunun, sorular sorun ve dayanışma ağımıza katılın.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Edit3 size={18} /> Yeni Konu Aç
        </button>
      </div>

      {showForm && (
        <form className="forum-form glass-panel animate-fade-in" onSubmit={handleCreatePost}>
          <h3>Yeni Tartışma Konusu</h3>
          <div className="form-group">
            <label>Kategori</label>
            <select className="input-field select-input" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
              {FORUM_CATEGORIES.filter(c => c !== "Tümü").map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Konu Başlığı</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Örn: DYK Kursları Açılış Şartları Nelerdir?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              maxLength={120}
            />
          </div>
          <div className="form-group">
            <label>İçerik</label>
            <textarea 
              className="input-field" 
              placeholder="Sormak istediğiniz soruyu veya paylaşmak istediğiniz bilgiyi detaylıca yazın..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={6}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>İptal</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Gönderiliyor...' : 'Konuyu Paylaş'}
            </button>
          </div>
        </form>
      )}

      <div className="forum-layout">
        {/* Sidebar / Kategoriler */}
        <div className="forum-sidebar glass-panel">
          <h3>Kategoriler</h3>
          <ul className="category-list">
            {FORUM_CATEGORIES.map(cat => (
              <li key={cat}>
                <button 
                  className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  <span className="cat-dot" style={{ backgroundColor: cat !== "Tümü" ? getCategoryBadgeColor(cat) : 'var(--color-text-muted)' }}></span>
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Konu Listesi */}
        <div className="forum-main">
          {isLoading ? (
            <div className="forum-loading">
              {[1,2,3,4].map(i => (
                <div key={i} className="forum-post-card skeleton-card" style={{ height: '140px' }}></div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="forum-post-list">
              {posts.map(post => (
                <div key={post.id} className="forum-post-card glass-panel hover-effect">
                  <div className="post-header">
                    <span className="post-category" style={{ color: getCategoryBadgeColor(post.category), backgroundColor: `${getCategoryBadgeColor(post.category)}15` }}>
                      {post.category}
                    </span>
                    <span className="post-date"><Clock size={14} /> {new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <h4 className="post-title">{post.title}</h4>
                  <p className="post-snippet">{post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content}</p>
                  
                  <div className="post-footer">
                    <div className="post-author">
                      <div className="author-avatar">{post.user_name.charAt(0).toUpperCase()}</div>
                      <span>{post.user_name}</span>
                    </div>
                    <div className="post-stats">
                      <span title="Görüntülenme"><Eye size={16} /> {post.views || 0}</span>
                      <span title="Cevaplar"><MessageCircle size={16} /> {post.replies || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state glass-panel">
              <MessageCircle size={48} color="var(--color-text-muted)" style={{ marginBottom: '1rem' }} />
              <h3>Bu kategoride henüz konu yok</h3>
              <p>İlk tartışmayı siz başlatın ve diğer öğretmenlerin fikirlerini alın.</p>
              {!showForm && (
                <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => setShowForm(true)}>
                  İlk Konuyu Aç
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;
