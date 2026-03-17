import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, LogOut, Upload } from 'lucide-react';
import AuthModal from './AuthModal';
import UploadModal from './UploadModal';
import { supabase } from '../supabaseClient';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  
  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('currentUser');
    setUser(null);
    window.location.reload();
  };

  const handleLoginClick = () => {
    setIsLoginView(true);
    setIsAuthOpen(true);
  };

  const handleRegisterClick = () => {
    setIsLoginView(false);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = () => {
    const storedUser = localStorage.getItem('currentUser');
    setUser(JSON.parse(storedUser));
    window.location.reload(); // Reload to fetch user docs potentially if needed
  };

  const handleUploadSuccess = (newDoc) => {
    // Arama sayfasında güncellenmiş belgeleri göstermek için sayfayı yenile
    // Gerçek bir uygulamada Context veya Redux kullanılırdı
    window.location.reload();
  };

  return (
    <>
      <header className="navbar glass-panel">
        <div className="container nav-container">
          <Link to="/" className="brand">
            <div className="brand-icon">
              <BookOpen size={24} color="var(--color-primary)" />
            </div>
            <h1>Öğretmen<span> Döküman</span></h1>
          </Link>

          <nav className="nav-actions">
            {user ? (
              <>
                <span className="welcome-text">
                  Hoşgeldin, <strong><Link to="/profile" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{user.username}</Link></strong>
                </span>
                <button 
                  className="btn btn-outline nav-btn"
                  onClick={() => setIsUploadOpen(true)}
                >
                  <Upload size={18} /> Yükle
                </button>
                <button className="btn btn-ghost nav-btn" onClick={handleLogout}>
                  <LogOut size={18} /> Çıkış
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost nav-btn" onClick={handleLoginClick}>
                  Giriş Yap
                </button>
                <button className="btn btn-primary nav-btn" onClick={handleRegisterClick}>
                  <User size={18} /> Kayıt Ol
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        isLoginView={isLoginView}
        onLoginSuccess={handleAuthSuccess}
      />

      <UploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
};

export default Navbar;
