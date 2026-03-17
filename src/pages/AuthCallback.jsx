import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AuthCallback = () => {
  const [status, setStatus] = useState('Doğrulanıyor...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL'deki hash veya query parametrelerini işle
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const type = hashParams.get('type') || queryParams.get('type');
        
        if (accessToken) {
          // Session'ı kur
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (error) {
            setStatus('Doğrulama başarısız: ' + error.message);
            setTimeout(() => navigate('/'), 3000);
            return;
          }

          if (session) {
            // Kullanıcı bilgilerini LocalStorage'a kaydet
            const { data: userData } = await supabase
              .from('users')
              .select('username, email')
              .eq('email', session.user.email)
              .single();

            if (userData) {
              localStorage.setItem('currentUser', JSON.stringify({
                email: session.user.email,
                username: userData.username,
                id: session.user.id
              }));
            }

            if (type === 'recovery') {
              setStatus('✅ Şifre sıfırlama başarılı! Yeni şifrenizi belirleyin...');
              setTimeout(() => navigate('/profile'), 2000);
            } else {
              setStatus('✅ E-posta doğrulandı! Giriş yapılıyor...');
              setTimeout(() => { navigate('/'); window.location.reload(); }, 1500);
            }
          }
        } else {
          setStatus('Geçersiz bağlantı. Ana sayfaya yönlendiriliyorsunuz...');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (err) {
        console.error('Auth callback hatası:', err);
        setStatus('Bir hata oluştu. Ana sayfaya yönlendiriliyorsunuz...');
        setTimeout(() => navigate('/'), 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1rem',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid var(--color-primary-light)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <h2 style={{ color: 'var(--color-text-main)' }}>{status}</h2>
    </div>
  );
};

export default AuthCallback;
