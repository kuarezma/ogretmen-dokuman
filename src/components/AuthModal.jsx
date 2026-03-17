import React, { useState } from 'react';
import { X, User, Lock, Mail } from 'lucide-react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, isLoginView, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(isLoginView);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      // Mock Login
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.username === formData.username && u.password === formData.password);
      
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        onLoginSuccess();
        onClose();
      } else {
        setError('Kullanıcı adı veya şifre hatalı!');
      }
    } else {
      // Mock Register
      if (formData.username.length < 3 || formData.password.length < 6) {
        setError('Kullanıcı adı en az 3, şifre en az 6 karakter olmalıdır.');
        return;
      }
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find(u => u.username === formData.username);
      
      if (existingUser) {
        setError('Bu kullanıcı adı zaten alınmış!');
        return;
      }

      const newUser = { username: formData.username, email: formData.email, password: formData.password };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Auto login after register
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      onLoginSuccess();
      onClose();
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content glass-panel">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="modal-header">
          <h2>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
          <p>{isLogin ? 'Platforma hoşgeldiniz, lütfen giriş yapın.' : 'Aramıza katılın ve belgelerinizi paylaşın.'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Kullanıcı Adı" 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required 
            />
          </div>

          {!isLogin && (
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
          )}

          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input 
              type="password" 
              className="input-field" 
              placeholder="Şifre" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary auth-btn">
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="modal-footer">
          <p>
            {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
            <button 
              className="toggle-auth-btn" 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
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
