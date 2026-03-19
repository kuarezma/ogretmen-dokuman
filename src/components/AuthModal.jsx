import React, { useState } from 'react';
import { X, User, Lock, Mail } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './AuthModal.css'; 

const AuthModal = ({ isOpen, onClose, isLoginView, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(isLoginView);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data, error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (googleError) {
        setError('Google ile giriş başarısız: ' + googleError.message);
        setIsLoading(false);
      }
    } catch {
      setError('Google ile giriş sırasında bir hata oluştu.');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Şifre sıfırlama için lütfen e-posta adresinizi girin.');
      return;
    }
    setIsLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: window.location.origin + '/profile',
    });
    setIsLoading(false);
    if (resetError) {
      setError('Şifre sıfırlama e-postası gönderilemedi: ' + resetError.message);
    } else {
      setResetSent(true);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          setError('E-posta adresi veya şifre hatalı!');
          setIsLoading(false);
          return;
        }

        if (data.user && !data.user.email_confirmed_at) {
          setError('Lütfen önce e-posta adresinizi doğrulayın. Doğrulama e-postası spam klasöründe olabilir.');
          setIsLoading(false);
          return;
        }

        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('email', formData.email)
          .single();

        const userObj = {
          email: formData.email,
          username: userData ? userData.username : formData.email.split('@')[0],
          id: data.user.id
        };

        localStorage.setItem('currentUser', JSON.stringify(userObj));
        onLoginSuccess();
        onClose();

      } else {
        if (formData.username.length < 3 || formData.password.length < 6) {
          setError('Kullanıcı adı en az 3, şifre en az 6 karakter olmalıdır.');
          setIsLoading(false);
          return;
        }

        const { data: existingUser } = await supabase
          .from('users')
          .select('username')
          .eq('username', formData.username)
          .single();

        if (existingUser) {
          setError('Bu kullanıcı adı zaten sistemde kayıtlı!');
          setIsLoading(false);
          return;
        }

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username
            },
            emailRedirectTo: window.location.origin
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
             setError('Bu e-posta adresi ile zaten kayıt olunmuş.');
          } else {
             setError(signUpError.message);
          }
          setIsLoading(false);
          return;
        }

        if (authData?.user && !authData.user.email_confirmed_at) {
          setError('Kayıt başarılı! Lütfen e-posta adresinize gönderilen doğrulama linkine tıklayın.');
          setIsLoading(false);
          return;
        }

        await supabase.from('users').insert([{ 
          username: formData.username, 
          email: formData.email,
          password: 'encrypted'
        }]);

        const userObj = {
          email: formData.email,
          username: formData.username,
          id: authData?.user?.id
        };

        localStorage.setItem('currentUser', JSON.stringify(userObj));
        onLoginSuccess();
        onClose();
      }
    } catch {
      setError('Bağlantı sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content glass-panel">
        <button className="modal-close" onClick={onClose} disabled={isLoading}>
          <X size={24} />
        </button>
        
        <div className="modal-header">
          <h2>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
          <p>{isLogin ? 'Platforma hoşgeldiniz, lütfen e-posta ve şifrenizle giriş yapın.' : 'Aramıza katılın ve kendi belgelerinizi paylaşın.'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="button" 
          className="btn btn-google auth-btn-google" 
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.75rem',
            background: 'white',
            color: '#333',
            border: '1px solid #ddd',
            marginBottom: '1rem'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google ile {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
        </button>

        <div className="auth-divider">
          <div className="auth-divider-line"></div>
          <span className="auth-divider-text">veya</span>
          <div className="auth-divider-line"></div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <User className="input-icon" size={20} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Kullanıcı Adı" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required={!isLogin} 
              />
            </div>
          )}

          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input 
              type="email" 
              className="input-field" 
              placeholder="E-posta Adresi" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input 
              type="password" 
              className="input-field" 
              placeholder="Şifre (En az 6 karakter)" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={isLoading}>
            {isLoading ? 'Lütfen Bekleyin...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </button>

          {isLogin && (
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              {resetSent ? (
                <p style={{ color: 'var(--color-success, #10b981)', fontSize: '0.9rem' }}>✅ Şifre sıfırlama e-postası gönderildi!</p>
              ) : (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
                >
                  Şifremi Unuttum
                </button>
              )}
            </div>
          )}
        </form>

        <div className="modal-footer">
          <p>
            {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
            <button 
              className="toggle-auth-btn" 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              disabled={isLoading}
            >
              {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
