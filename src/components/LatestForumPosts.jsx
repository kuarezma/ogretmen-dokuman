import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { MessageCircle, Clock, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './LatestForumPosts.css';

const LatestForumPosts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  const fetchLatestPosts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (!error && data) {
        setPosts(data);
      }
    } catch (err) {
      console.error("Son forum mesajları çekilemedi:", err);
    } finally {
      setIsLoading(false);
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
    <div className="latest-forum-widget glass-panel">
      <div className="widget-header">
        <h3>
          <Users size={20} color="var(--color-primary)" /> Öğretmenler Odası'nda Son Konular
        </h3>
        <Link to="/forum" className="view-all-link">
          Tümüne Git <ArrowRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div className="widget-loading">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton skeleton-line long" style={{ height: '40px', marginBottom: '0.5rem' }}></div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <ul className="latest-forum-list">
          {posts.map(post => (
            <li key={post.id} className="latest-forum-item">
              <div className="item-meta">
                <span className="item-category" style={{ color: getCategoryBadgeColor(post.category), backgroundColor: `${getCategoryBadgeColor(post.category)}15` }}>
                  {post.category}
                </span>
                <span className="item-date">
                  <Clock size={12} /> {new Date(post.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <Link to="/forum" className="item-title-link">
                <h4>{post.title}</h4>
              </Link>
              <div className="item-footer">
                <span className="item-author">{post.user_name}</span>
                <span className="item-replies">
                  <MessageCircle size={12} /> {post.replies || 0} yanıt
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="widget-empty">
          <MessageCircle size={24} color="var(--color-text-muted)" />
          <p>Henüz açılmış bir konu yok.</p>
        </div>
      )}
    </div>
  );
};

export default LatestForumPosts;
