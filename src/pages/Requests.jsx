import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { HandHelping, MessageSquarePlus, Clock, Search, HelpCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './Requests.css';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // New Request Form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Table might not exist yet!
        console.warn("Requests tablosu bulunamadı veya hata oluştu:", error.message);
        setRequests([]); // Fallback
      } else {
        setRequests(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRequest = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Talep oluşturmak için giriş yapmalısınız.');
      return;
    }
    if (!newTitle.trim() || !newDesc.trim()) {
      toast.error('Lütfen başlık ve açıklama girin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('requests')
        .insert([{
          user_name: currentUser.username,
          title: newTitle.trim(),
          description: newDesc.trim(),
          status: 'open'
        }])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setRequests([data[0], ...requests]);
        setShowForm(false);
        setNewTitle("");
        setNewDesc("");
        toast.success("Talebiniz başarıyla oluşturuldu!");
      }
    } catch (error) {
      toast.error("Talep kaydedilirken hata oluştu. Veri tabanı tablosu (requests) oluşturulmamış olabilir.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'resolved') {
      return <span className="req-badge resolved"><CheckCircle size={14} /> Çözüldü</span>;
    }
    return <span className="req-badge open"><Clock size={14} /> Bekleniyor</span>;
  };

  return (
    <div className="requests-page container animate-fade-in">
      <div className="requests-header">
        <div className="req-title-section">
          <h2><HandHelping size={28} color="var(--color-primary)" /> Talep Tahtası</h2>
          <p>Aradığınız dökümanı bulamadınız mı? Buraya yazın, diğer öğretmenler yardımcı olsun.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <MessageSquarePlus size={18} /> Yeni Talep Oluştur
        </button>
      </div>

      {showForm && (
        <form className="new-request-form glass-panel animate-fade-in" onSubmit={handleAddRequest}>
          <h3>Yeni Belge Talebi</h3>
          <div className="form-group">
            <label>Ne Arıyorsunuz? (Kısa Başlık)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Örn: 7. Sınıf Sosyal Bilgiler BEP Planı"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="form-group">
            <label>Detaylı Açıklama</label>
            <textarea 
              className="input-field" 
              placeholder="İstediğiniz belgenin detaylarını, hangi haftaya ait olduğunu veya özel gereksinimleri yazın..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={4}
              maxLength={500}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>İptal</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Gönderiliyor...' : 'Talebi Yayınla'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="requests-list">
          {[1,2,3].map(i => (
            <div key={i} className="req-card skeleton-card" style={{ minHeight: '120px' }}></div>
          ))}
        </div>
      ) : requests.length > 0 ? (
        <div className="requests-list">
          {requests.map(req => (
            <div key={req.id} className="req-card glass-panel">
              <div className="req-card-main">
                <div className="req-card-header">
                  <h4>{req.title}</h4>
                  {getStatusBadge(req.status)}
                </div>
                <p className="req-desc">{req.description}</p>
                <div className="req-footer">
                  <span className="req-author">👤 {req.user_name}</span>
                  <span className="req-date">🕒 {new Date(req.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
              <div className="req-card-actions">
                <button className="btn btn-outline btn-sm" onClick={() => toast("Bu özellik yakında aktif olacak!")}>
                  <HelpCircle size={16} /> Yanıtla / Dosya Ekle
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-panel">
          <HandHelping size={48} color="var(--color-text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>Henüz kimse talep oluşturmamış</h3>
          <p>Aradığınız bir belge varsa ilk talebi siz oluşturun.</p>
        </div>
      )}
    </div>
  );
};

export default Requests;
