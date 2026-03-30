import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Trophy, Medal, Award, TrendingUp, Star } from 'lucide-react';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      // Fetch all docs to group by user and calculate scores
      const { data: docs, error } = await supabase
        .from('documents')
        .select('uploaded_by, download_count, likes_count');
      
      if (error) throw error;

      // Grouping and scoring logic
      // Score calculation: 1 download = 1 point, 1 like = 5 points
      const userStats = {};
      
      (docs || []).forEach(doc => {
        const user = doc.uploaded_by;
        if (!user) return;
        
        if (!userStats[user]) {
          userStats[user] = { username: user, score: 0, downloads: 0, likes: 0 };
        }
        
        userStats[user].downloads += (doc.download_count || 0);
        userStats[user].likes += (doc.likes_count || 0);
        userStats[user].score += (doc.download_count || 0) + ((doc.likes_count || 0) * 5);
      });

      // Sort by score descending and take top 10
      const rankedUsers = Object.values(userStats)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      // Fetch avatars for these top users
      const usernames = rankedUsers.map(u => u.username);
      if (usernames.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('username, avatar_url')
          .in('username', usernames);
          
        if (usersData) {
          const avatarMap = {};
          usersData.forEach(u => { avatarMap[u.username] = u.avatar_url; });
          rankedUsers.forEach(u => { u.avatar_url = avatarMap[u.username]; });
        }
      }

      setLeaders(rankedUsers);
    } catch (err) {
      console.error("Liderlik tablosu yüklenemedi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeName = () => {
    return "Öğretmen";
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy size={18} color="#f59e0b" fill="#fef3c7" />;
    if (index === 1) return <Medal size={18} color="#94a3b8" fill="#f1f5f9" />;
    if (index === 2) return <Medal size={18} color="#b45309" fill="#fef3c7" />;
    return <span className="rank-number">{index + 1}</span>;
  };

  return (
    <div className="leaderboard-container glass-panel">
      <div className="leaderboard-header">
        <h3><TrendingUp size={20} /> Top 10 Öğretmen</h3>
        <span className="leaderboard-subtitle">Aylık en çok katkı sağlayanlar</span>
      </div>
      
      {isLoading ? (
        <div className="leaderboard-loading">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="leaderboard-skeleton-item">
              <div className="skeleton skeleton-circle sm"></div>
              <div className="skeleton skeleton-line medium"></div>
            </div>
          ))}
        </div>
      ) : leaders.length > 0 ? (
        <ul className="leaderboard-list">
          {leaders.map((user, index) => (
            <li key={user.username} className="leaderboard-item">
              <div className="leaderboard-rank">
                {getRankIcon(index)}
              </div>
              
              <div className="leaderboard-user-info">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="leaderboard-avatar" />
                ) : (
                  <div className="leaderboard-avatar-placeholder">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className="leaderboard-user-details">
                  <span className="leaderboard-username" title={user.username}>{user.username}</span>
                  <div className="leaderboard-meta">
                    <span className="leaderboard-badge">
                      <Award size={12} style={{ marginRight: '2px' }} />
                      {getBadgeName(user.score)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="leaderboard-score" title={`${user.downloads} İndirme, ${user.likes} Beğeni`}>
                <span className="score-value">{user.score}</span>
                <span className="score-label">puan</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="leaderboard-empty">
          <Star size={24} color="var(--color-text-muted)" />
          <p>Henüz yeterli veri yok.</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
