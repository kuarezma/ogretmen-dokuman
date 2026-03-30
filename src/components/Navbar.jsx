import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, User, LogOut, Upload, Moon, Sun, BarChart2, Menu, X, HandHelping, Bot, Users, Home } from 'lucide-react';
import AuthModal from './AuthModal';
import QuickAddModal from './QuickAddModal';
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
        <div className="nav-container">
          <Link to="/" className="brand">
            <div className="brand-icon">
              <BookOpen size={24} color="var(--color-primary)" />
            </div>
            <h1>Öğretmen<span> Döküman</span></h1>
          </Link>

          {/* Mobile Menu Toggle & Profile */}
          <div className="mobile-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn btn-ghost mobile-only-dark-toggle"
              onClick={toggleDarkMode}
              title={isDark ? 'Açık Mod' : 'Karanlık Mod'}
              style={{ padding: '0.4rem', color: 'var(--color-text-main)' }}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {user ? (
              <Link to="/profile" className="mobile-profile-btn-direct" aria-label="Profil" style={{ alignItems: 'center', color: 'var(--color-primary)' }}>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Profil" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary-light)' }} />
                ) : (
                  <User size={24} />
                )}
              </Link>
            ) : (
              <button className="btn btn-ghost mobile-login-btn-direct" onClick={() => handleLoginClick()} style={{ padding: '0.4rem 0.6rem', fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                Giriş
              </button>
            )}
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              title="Menü"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <nav className={`nav-actions ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {/* Center Navigation Links */}
            <div className="nav-center-links">
              <Link to="/" className={`nav-badge-btn nav-badge-home ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                <Home size={16}/> Ana Sayfa
              </Link>
              <Link to="/requests" className={`nav-badge-btn nav-badge-requests ${location.pathname === '/requests' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                <HandHelping size={16}/> Talep Tahtası
              </Link>
              <Link to="/forum" className={`nav-badge-btn nav-badge-forum ${location.pathname === '/forum' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                <Users size={16}/> Öğretmenler Odası
              </Link>
              <Link to="/ai-generator" className={`nav-badge-btn nav-badge-ai ${location.pathname === '/ai-generator' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                <Bot size={16}/> Yapay Zeka
              </Link>
              <Link to="/stats" className={`nav-badge-btn nav-badge-stats ${location.pathname === '/stats' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                <BarChart2 size={16}/> İstatistikler
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
                  className="btn btn-ghost nav-btn mobile-badge-profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={18} />
                  <span className="mobile-nav-text">Profil</span>
                </Link>
                <button 
                  className="btn btn-ghost nav-btn mobile-badge-logout" 
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  <span className="mobile-nav-text">Çıkış Yap</span>
                </button>
                <button 
                  className="btn btn-outline nav-btn mobile-badge-upload"
                  onClick={() => { setIsUploadOpen(true); setIsMobileMenuOpen(false); }}
                >
                  <Upload size={18} /> <span className="nav-btn-text">Yükle</span>
                  <span className="mobile-nav-text">Belge Yükle</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn btn-ghost nav-btn mobile-badge-login" 
                  onClick={() => { handleLoginClick(); setIsMobileMenuOpen(false); }}
                >
                  <User size={18} /> Giriş Yap
                </button>
                <button 
                  className="btn btn-primary nav-btn mobile-badge-register" 
                  onClick={() => { handleRegisterClick(); setIsMobileMenuOpen(false); }}
                >
                  <Users size={18} /> Kayıt Ol
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

      <QuickAddModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </>
  );
};

export default Navbar;
