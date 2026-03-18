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
