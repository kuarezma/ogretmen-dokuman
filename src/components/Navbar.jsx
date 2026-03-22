import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, User, LogOut, Upload, Moon, Sun, BarChart2, Menu, X, HandHelping, Bot } from 'lucide-react';
import AuthModal from './AuthModal';
import UploadModal from './UploadModal';
import { supabase } from '../supabaseClient';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const location = useLocation(); // Initialize useLocation hook

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // LocalStorage'dan dark mode tercihini oku
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

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
    window.location.reload();
  };

  const handleUploadSuccess = () => {
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

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            title="Menü"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`nav-actions ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {/* Center Navigation Links */}
            <div className="nav-center-links">
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                Ana Sayfa
              </Link>
              <Link to="/requests" className={`nav-link ${location.pathname === '/requests' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setIsMobileMenuOpen(false)}>
                <HandHelping size={16}/> Talep Tahtası
              </Link>
              <Link to="/ai-generator" className={`nav-link ${location.pathname === '/ai-generator' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setIsMobileMenuOpen(false)}>
                <Bot size={16}/> Makine
              </Link>
              <Link to="/stats" className={`nav-link ${location.pathname === '/stats' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                İstatistikler
              </Link>
            </div>

            <button
              className="btn btn-ghost nav-btn dark-toggle"
              onClick={toggleDarkMode}
              title={isDark ? 'Açık Mod' : 'Karanlık Mod'}
              style={{ padding: '0.4rem 0.6rem' }}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                <span className="welcome-text">
                  Hoşgeldin, <strong><Link to="/profile" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{user.username}</Link></strong>
                </span>
                <Link
                  to="/profile"
                  className="btn btn-ghost nav-btn"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ padding: '0.4rem 0.6rem' }}
                >
                  <User size={18} />
                  <span className="mobile-nav-text">Profil</span>
                </Link>
                <button 
                  className="btn btn-outline nav-btn"
                  onClick={() => { setIsUploadOpen(true); setIsMobileMenuOpen(false); }}
                >
                  <Upload size={18} /> <span className="nav-btn-text">Yükle</span>
                  <span className="mobile-nav-text">Belge Yükle</span>
                </button>
                <button className="btn btn-ghost nav-btn" onClick={handleLogout}>
                  <LogOut size={18} />
                  <span className="mobile-nav-text">Çıkış Yap</span>
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost nav-btn" onClick={() => { handleLoginClick(); setIsMobileMenuOpen(false); }}>
                  Giriş Yap
                </button>
                <button className="btn btn-primary nav-btn" onClick={() => { handleRegisterClick(); setIsMobileMenuOpen(false); }}>
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
