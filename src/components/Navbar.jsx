import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDark(prevDark => {
      const newDark = !prevDark;
      if (newDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      }
      return newDark;
    });
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('currentUser');
    setUser(null);
    window.location.reload();
  }, []);

  const handleLoginClick = useCallback(() => {
    setIsLoginView(true);
    setIsAuthOpen(true);
  }, []);

  const handleRegisterClick = useCallback(() => {
    setIsLoginView(false);
    setIsAuthOpen(true);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    const storedUser = localStorage.getItem('currentUser');
    setUser(JSON.parse(storedUser));
    window.location.reload();
  }, []);

  const handleUploadSuccess = useCallback(() => {
    window.location.reload();
  }, []);

  const handleUploadClick = useCallback(() => {
    if (user) {
      setIsUploadOpen(true);
    } else {
      setIsLoginView(true);
      setIsAuthOpen(true);
    }
    setIsMobileMenuOpen(false);
  }, [user]);

  const navLinks = useMemo(() => [
    { to: '/', icon: <Home size={16}/>, label: 'Ana Sayfa', className: 'nav-badge-home' },
    { to: '/requests', icon: <HandHelping size={16}/>, label: 'Talep Tahtası', className: 'nav-badge-requests' },
    { to: '/forum', icon: <Users size={16}/>, label: 'Öğretmenler Odası', className: 'nav-badge-forum' },
    { to: '/ai-generator', icon: <Bot size={16}/>, label: 'Yapay Zeka', className: 'nav-badge-ai' },
    { to: '/stats', icon: <BarChart2 size={16}/>, label: 'İstatistikler', className: 'nav-badge-stats' }
  ], []);

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
              <Link to="/profile" className="mobile-profile-btn-direct" aria-label="Profil" style={{ display: 'flex', alignItems: 'center', color: 'var(--color-primary)' }}>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Profil" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary-light)' }} />
                ) : (
                  <User size={24} />
                )}
              </Link>
            ) : (
              <button className="btn btn-ghost mobile-login-btn-direct" onClick={handleLoginClick} style={{ padding: '0.4rem 0.6rem', fontSize: '0.9rem', color: 'var(--color-primary)' }}>
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
            <div className="nav-center-links">
              {navLinks.map(link => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className={`nav-badge-btn ${link.className} ${location.pathname === link.to ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
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
                  onClick={handleUploadClick}
                >
                  <Upload size={18} /> <span className="nav-btn-text">Yükle</span>
                  <span className="mobile-nav-text">Belge Yükle</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn btn-outline nav-btn mobile-badge-upload"
                  onClick={handleUploadClick}
                >
                  <Upload size={18} /> Belge Yükle
                </button>
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

export default React.memo(Navbar);
