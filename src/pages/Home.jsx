import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SearchBar from '../components/SearchBar';
import DocumentCard from '../components/DocumentCard';
import { Sparkles, Folder, ChevronRight, ChevronLeft, Home as HomeIcon, Plus } from 'lucide-react';
import Leaderboard from '../components/Leaderboard';
import CalendarWidget from '../components/CalendarWidget';
import LatestForumPosts from '../components/LatestForumPosts';
import QuickAddModal from '../components/QuickAddModal';
import DocumentPreviewModal from '../components/DocumentPreviewModal';
import './Home.css';

const Home = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [user, setUser] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Kategori Hiyerarşisi State Yönetimi (0: Sınıf Seç, 1: Ders Seç, 2: Kategori Seç, 3: Belgeler)
  const [folderLevel, setFolderLevel] = useState(0); 
  const [currentPath, setCurrentPath] = useState({ grade: null, lesson: null, category: null });
  
  useEffect(() => {
    fetchDocuments();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (profile) {
        setUser({ ...profile, email: session.user.email });
      } else {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Kullanıcı',
          email: session.user.email
        });
      }
    }
  };

  const handleQuickAddSuccess = (newDoc) => {
    if (!newDoc) return;

    const normalizedDoc = {
      ...newDoc,
      description: newDoc.topic,
      uploader: newDoc.uploaded_by,
      downloads: newDoc.download_count || 0
    };

    setDocuments(prev => [normalizedDoc, ...prev]);
    setFilteredDocs(prev => [normalizedDoc, ...prev]);
  };

  const handlePreview = (doc) => {
    setPreviewDoc(doc);
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedDocs = (data || []).map(doc => ({
        ...doc,
        description: doc.topic,
        uploader: doc.uploaded_by,
        downloads: 0
      }));

      setDocuments(mappedDocs);
      setFilteredDocs(mappedDocs);
    } catch (err) {
      console.error('Veritabanından belgeler çekilemedi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async ({ searchTerm, format, grade, lesson, category, sortBy = 'newest', dateRange = 'all' }) => {
    if (!searchTerm && format === 'all' && grade === 'Tüm Sınıflar' && category === 'Tüm Kategoriler' && dateRange === 'all') {
      setFilteredDocs(documents);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      let query = supabase.from('documents').select('*');

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,topic.ilike.%${searchTerm}%,uploaded_by.ilike.%${searchTerm}%`);
      }

      if (format !== 'all') {
        query = query.eq('type', format);
      }

      if (grade && grade !== 'Tüm Sınıflar') {
        query = query.eq('grade', grade);
      }
      
      if (lesson && lesson !== 'Tüm Dersler') {
        query = query.eq('lesson', lesson);
      }

      if (category && category !== 'Tüm Kategoriler') {
        query = query.eq('category', category);
      }

      if (dateRange !== 'all') {
        const now = new Date();
        let startDate;
        switch (dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
            break;
          case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
            break;
        }
        if (startDate) {
          query = query.gte('created_at', startDate);
        }
      }

      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'most_downloaded':
          query = query.order('download_count', { ascending: false, nullsFirst: false });
          break;
        case 'most_liked':
          query = query.order('likes_count', { ascending: false, nullsFirst: false });
          break;
        case 'title_asc':
          query = query.order('title', { ascending: true });
          break;
        case 'title_desc':
          query = query.order('title', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      const mappedDocs = (data || []).map(doc => ({
        ...doc,
        description: doc.topic,
        uploader: doc.uploaded_by,
        downloads: doc.download_count || 0
      }));

      setFilteredDocs(mappedDocs);
    } catch (err) {
      console.error("Arama sırasında hata:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Son Eklenenler vitrini için ilk 3 belgeyi al
  const recentDocuments = documents.slice(0, 3);

  // Kategori Listeleri Aktarıcısı
  const GRADE_LESSONS = {
    "Okul Öncesi": ["Oyun ve Etkinlik", "Boyama", "Masal / Hikaye", "Diğer"],
    "1. Sınıf": ["Okuma Yazma Öğreniyorum", "Matematik", "Hayat Bilgisi", "Müzik", "Görsel Sanatlar", "Beden Eğitimi", "Diğer"],
    "2. Sınıf": ["Türkçe", "Matematik", "Hayat Bilgisi", "İngilizce", "Görsel Sanatlar", "Müzik", "Beden Eğitimi", "Diğer"],
    "3. Sınıf": ["Türkçe", "Matematik", "Hayat Bilgisi", "Fen Bilimleri", "İngilizce", "Görsel Sanatlar", "Müzik", "Beden Eğitimi", "Diğer"],
    "4. Sınıf": ["Türkçe", "Matematik", "Fen Bilimleri", "Sosyal Bilgiler", "İngilizce", "Din Kültürü", "İnsan Hakları", "Görsel Sanatlar", "Müzik", "Diğer"],
    "5. Sınıf": ["Türkçe", "Matematik", "Fen Bilimleri", "Sosyal Bilgiler", "İngilizce", "Din Kültürü", "Bilişim Teknolojileri", "Müzik", "Görsel Sanatlar", "Seçmeli Dersler", "Diğer"],
    "6. Sınıf": ["Türkçe", "Matematik", "Fen Bilimleri", "Sosyal Bilgiler", "İngilizce", "Din Kültürü", "Bilişim Teknolojileri", "Müzik", "Görsel Sanatlar", "Seçmeli Dersler", "Diğer"],
    "7. Sınıf": ["Türkçe", "Matematik", "Fen Bilimleri", "Sosyal Bilgiler", "İngilizce", "Din Kültürü", "Teknoloji ve Tasarım", "Görsel Sanatlar", "Müzik", "Seçmeli Dersler", "Diğer"],
    "8. Sınıf": ["Türkçe", "Matematik", "Fen Bilimleri", "T.C. İnkılap Tarihi", "İngilizce", "Din Kültürü", "Teknoloji ve Tasarım", "Görsel Sanatlar", "Müzik", "Seçmeli Dersler", "Diğer"],
    "9. Sınıf": ["Türk Dili ve Edebiyatı", "Matematik", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "İngilizce", "Almanca", "Din Kültürü", "Meslek Dersleri", "Diğer"],
    "10. Sınıf": ["Türk Dili ve Edebiyatı", "Matematik", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "Felsefe", "İngilizce", "Almanca", "Din Kültürü", "Meslek Dersleri", "Diğer"],
    "11. Sınıf": ["Türk Dili ve Edebiyatı", "Matematik", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "Felsefe", "İngilizce", "Almanca", "Din Kültürü", "Meslek Dersleri", "Diğer"],
    "12. Sınıf": ["Türk Dili ve Edebiyatı", "Matematik", "Fizik", "Kimya", "Biyoloji", "T.C. İnkılap Tarihi", "Coğrafya", "İngilizce", "Almanca", "Din Kültürü", "Meslek Dersleri", "Diğer"],
    "Genel / Ortak": ["Klavuzlar", "Yönetmelikler", "Rehberlik", "Sınıf Öğretmenliği", "ŞÖK Toplantıları", "Veli Toplantıları", "Diğer"]
  };
  const DOC_CATEGORIES = ["Yazılı Soruları", "Deneme / Test", "Yıllık Plan", "Günlük Plan", "Proje / Performans", "Zümre Tutanakları", "Etkinlik / Çalışma Kağıdı", "Sunum (Slayt)", "Diğer"];

  const handleGradeClick = (gradeName) => {
    setCurrentPath({ grade: gradeName, lesson: null, category: null });
    setFolderLevel(1);
  };

  const handleLessonClick = (lessonName) => {
    setCurrentPath(prev => ({ ...prev, lesson: lessonName }));
    setFolderLevel(2);
  };

  const handleCategoryClick = (categoryName) => {
    setCurrentPath(prev => ({ ...prev, category: categoryName }));
    setFolderLevel(3);
  };

  const resetToHome = () => {
    setFolderLevel(0);
    setCurrentPath({ grade: null, lesson: null, category: null });
  };

  // Geri butonu
  const handleGoBack = () => {
    if (folderLevel === 3) {
      setFolderLevel(2);
      setCurrentPath(prev => ({ ...prev, category: null }));
    } else if (folderLevel === 2) {
      setFolderLevel(1);
      setCurrentPath(prev => ({ ...prev, lesson: null }));
    } else if (folderLevel === 1) {
      setFolderLevel(0);
      setCurrentPath({ grade: null, lesson: null, category: null });
    }
  };

  // Level Render Metodları
  const renderBreadcrumb = () => (
    <div className="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
      <button 
        onClick={handleGoBack}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--color-text)',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '0.9rem'
        }}
      >
        <ChevronLeft size={18} /> Geri
      </button>
      
      <button onClick={resetToHome} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}>
        <HomeIcon size={16} style={{ marginRight: '0.25rem' }} /> Ana Sayfa
      </button>
      
      {currentPath.grade && (
        <>
          <ChevronRight size={16} color="var(--color-text-muted)" />
          <button onClick={() => { setFolderLevel(1); setCurrentPath(prev => ({ ...prev, lesson: null, category: null }))}} style={{ background: 'none', border: 'none', color: folderLevel === 1 ? 'var(--color-text)' : 'var(--color-primary)', cursor: 'pointer', fontWeight: folderLevel === 1 ? '600' : '500' }}>
            {currentPath.grade}
          </button>
        </>
      )}

      {currentPath.lesson && (
        <>
          <ChevronRight size={16} color="var(--color-text-muted)" />
          <button onClick={() => { setFolderLevel(2); setCurrentPath(prev => ({ ...prev, category: null }))}} style={{ background: 'none', border: 'none', color: folderLevel === 2 ? 'var(--color-text)' : 'var(--color-primary)', cursor: 'pointer', fontWeight: folderLevel === 2 ? '600' : '500' }}>
            {currentPath.lesson}
          </button>
        </>
      )}

      {currentPath.category && (
        <>
          <ChevronRight size={16} color="var(--color-text-muted)" />
          <span style={{ color: 'var(--color-text)', fontWeight: '600' }}>{currentPath.category}</span>
        </>
      )}
    </div>
  );

  const getFilteredByPathData = () => {
    return documents.filter(doc => 
      doc.grade === currentPath.grade && 
      doc.lesson === currentPath.lesson && 
      doc.category === currentPath.category
    );
  };

  return (
    <div className="home-page">
      <section className="hero-section container">
        <div className="hero-content">
          <h2 className="hero-title">
            Eğitim İçin Aradığınız <span>Tüm Belgeler</span> Burada
          </h2>
          <p className="hero-subtitle">
            Binlerce öğretmen tarafından paylaşılan yazılı soruları, testler, 
            yıllık planlar ve etkinlikleri anında bulun, indirin veya 
            kendi materyallerinizi paylaşın.
          </p>
        </div>
        
        <SearchBar onSearch={handleSearch} />
        
        {user && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              onClick={() => setShowQuickAdd(true)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', gap: '0.5rem' }}
            >
              <Plus size={18} /> Hızlı Belge Ekle
            </button>
          </div>
        )}
      </section>

      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSuccess={handleQuickAddSuccess}
      />

      <DocumentPreviewModal
        document={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

      {hasSearched ? (
        <section className="documents-section container animate-fade-in">
          <div className="section-header">
            <h3>
              Arama Sonuçları
              <span className="results-badge">{filteredDocs.length} Belge Bulundu</span>
            </h3>
          </div>

          {isSearching ? (
            <div className="documents-grid">
              {[1,2,3].map((i) => (
                <div key={i} className="skeleton-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div className="skeleton skeleton-circle"></div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div className="skeleton" style={{ width: '50px', height: '24px', borderRadius: '999px' }}></div>
                      <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '999px' }}></div>
                    </div>
                  </div>
                  <div className="skeleton skeleton-line title long"></div>
                  <div className="skeleton skeleton-line medium"></div>
                  <div className="skeleton skeleton-line short"></div>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                    <div className="skeleton skeleton-line short"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDocs.length > 0 ? (
            <div className="documents-grid">
              {filteredDocs.map((doc, index) => (
                <div key={doc.id} className={`fade-in delay-${(index % 3 + 1) * 100}`}>
                  <DocumentCard document={doc} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state glass-panel">
              <div className="empty-icon">📂</div>
              <h4>Aradığınız kritere uygun belge bulunamadı.</h4>
              <p>Farklı kelimelerle veya filtrelerle tekrar aramayı deneyin.</p>
            </div>
          )}
        </section>
      ) : (
        <div className="categories-container container animate-fade-in">
          
          {/* FOLDER SYSTEM (Breadcrumb) */}
          {folderLevel > 0 && renderBreadcrumb()}

          {/* LEVEL 0: Ana Sayfa Vitrin ve Sınıf Klasörleri */}
          {folderLevel === 0 && (
            <>
              {/* SON EKLENEN VİTRİNİ */}
              {isLoading ? (
                <section className="category-section highlight-section" style={{ marginBottom: '2.5rem' }}>
                  <div className="section-header">
                    <h3 style={{ color: 'var(--color-primary)' }}>
                      <Sparkles size={24} /> Yeni Yüklenen Belgeler
                      <span className="results-badge" style={{ marginLeft: 'auto' }}>Yeni</span>
                    </h3>
                  </div>
                  <div className="documents-grid">
                    {[1,2,3].map((i) => (
                      <div key={i} className="skeleton-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <div className="skeleton skeleton-circle"></div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div className="skeleton" style={{ width: '50px', height: '24px', borderRadius: '999px' }}></div>
                            <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '999px' }}></div>
                          </div>
                        </div>
                        <div className="skeleton skeleton-line title long"></div>
                        <div className="skeleton skeleton-line medium"></div>
                        <div className="skeleton skeleton-line short"></div>
                        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                          <div className="skeleton skeleton-line short"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : recentDocuments.length > 0 && (
                <section className="category-section highlight-section" style={{ marginBottom: '2.5rem' }}>
                  <div className="section-header">
                    <h3 style={{ color: 'var(--color-primary)' }}>
                      <Sparkles size={24} /> Yeni Yüklenen Belgeler
                      <span className="results-badge" style={{ marginLeft: 'auto' }}>Yeni</span>
                    </h3>
                  </div>
                  
                  <div className="documents-grid" style={{ marginBottom: '2.5rem' }}>
                    {recentDocuments.map((doc) => (
                      <div key={`recent-${doc.id}`} className="doc-item">
                        <DocumentCard document={doc} />
                      </div>
                    ))}
                  </div>

                </section>
              )}

              {/* OKUL ÖNCESİ */}
              <section className="category-section">
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#ec4899', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '4px', height: '20px', backgroundColor: '#ec4899', borderRadius: '2px' }}></span>
                  Okul Öncesi
                </h4>
                <div className="folder-grid">
                  <div 
                    onClick={() => handleGradeClick("Okul Öncesi")}
                    className="folder-card glass-panel hover-effect folder-preschool"
                  >
                    <Folder size={40} color="#ec4899" fill="currentColor" fillOpacity="0.15" />
                    <h4>Okul Öncesi</h4>
                  </div>
                </div>
              </section>

              {/* İLKOKUL (1-4) */}
              <section className="category-section">
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '4px', height: '20px', backgroundColor: '#10b981', borderRadius: '2px' }}></span>
                  İlkokul (1-4. Sınıflar)
                </h4>
                <div className="folder-grid">
                  {["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"].map((grade) => (
                    <div 
                      key={grade} 
                      onClick={() => handleGradeClick(grade)}
                      className="folder-card glass-panel hover-effect folder-primary"
                    >
                      <Folder size={40} color="#10b981" fill="currentColor" fillOpacity="0.15" />
                      <h4>{grade}</h4>
                    </div>
                  ))}
                </div>
              </section>

              {/* ORTAOKUL (5-8) */}
              <section className="category-section">
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '4px', height: '20px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></span>
                  Ortaokul (5-8. Sınıflar)
                </h4>
                <div className="folder-grid">
                  {["5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf"].map((grade) => (
                    <div 
                      key={grade} 
                      onClick={() => handleGradeClick(grade)}
                      className="folder-card glass-panel hover-effect folder-middle"
                    >
                      <Folder size={40} color="#3b82f6" fill="currentColor" fillOpacity="0.15" />
                      <h4>{grade}</h4>
                    </div>
                  ))}
                </div>
              </section>

              {/* LİSE (9-12) */}
              <section className="category-section">
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '4px', height: '20px', backgroundColor: '#8b5cf6', borderRadius: '2px' }}></span>
                  Lise (9-12. Sınıflar)
                </h4>
                <div className="folder-grid">
                  {["9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf"].map((grade) => (
                    <div 
                      key={grade} 
                      onClick={() => handleGradeClick(grade)}
                      className="folder-card glass-panel hover-effect folder-high"
                    >
                      <Folder size={40} color="#8b5cf6" fill="currentColor" fillOpacity="0.15" />
                      <h4>{grade}</h4>
                    </div>
                  ))}
                </div>
              </section>

              {/* GENEL */}
              <section className="category-section">
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '4px', height: '20px', backgroundColor: '#f59e0b', borderRadius: '2px' }}></span>
                  Genel / Ortak
                </h4>
                <div className="folder-grid">
                  <div 
                    onClick={() => handleGradeClick("Genel / Ortak")}
                    className="folder-card glass-panel hover-effect folder-general"
                  >
                    <Folder size={40} color="#f59e0b" fill="currentColor" fillOpacity="0.15" />
                    <h4>Genel / Ortak</h4>
                  </div>
                </div>
              </section>

              {/* Forum Widget */}
              <div style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                <LatestForumPosts />
              </div>

              {/* Leaderboard & Calendar Section rendered at the bottom */}
              <div style={{ marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                <Leaderboard />
                <CalendarWidget />
              </div>
            </>
          )}

          {/* LEVEL 1: Ders Klasörleri */}
          {folderLevel === 1 && currentPath.grade && (
            <section className="category-section animate-fade-in">
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                  {GRADE_LESSONS[currentPath.grade].map((lesson) => (
                    <div 
                      key={lesson} 
                      onClick={() => handleLessonClick(lesson)}
                      className="folder-card glass-panel hover-effect"
                      style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', borderRadius: 'var(--radius-lg)', minHeight: '70px' }}
                    >
                      <Folder size={32} color="var(--color-warning)" fill="currentColor" fillOpacity="0.15" style={{ opacity: 0.9 }} />
                      <h4 style={{ margin: 0, color: 'var(--color-text)', fontSize: '1.05rem' }}>{lesson}</h4>
                    </div>
                  ))}
               </div>
            </section>
          )}

          {/* LEVEL 2: Belge Türleri Klasörleri */}
          {folderLevel === 2 && currentPath.lesson && (
            <section className="category-section animate-fade-in">
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {DOC_CATEGORIES.map((cat) => (
                    <div 
                      key={cat} 
                      onClick={() => handleCategoryClick(cat)}
                      className="folder-card glass-panel hover-effect"
                      style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', borderRadius: 'var(--radius-lg)', minHeight: '70px' }}
                    >
                      <Folder size={32} color="#10b981" fill="currentColor" fillOpacity="0.15" style={{ opacity: 0.9 }} />
                      <h4 style={{ margin: 0, color: 'var(--color-text)', fontSize: '0.95rem' }}>{cat}</h4>
                    </div>
                  ))}
               </div>
            </section>
          )}

          {/* LEVEL 3: Nihai Kart Listesi (Belgeler) */}
          {folderLevel === 3 && currentPath.category && (
            <section className="category-section animate-fade-in">
               <div className="documents-grid">
                  {getFilteredByPathData().length > 0 ? (
                    getFilteredByPathData().map((doc) => (
                      <div key={doc.id} className="doc-item">
                        <DocumentCard document={doc} />
                      </div>
                    ))
                  ) : (
                    <div className="empty-state glass-panel" style={{ gridColumn: '1 / -1' }}>
                      <div className="empty-icon">📝</div>
                      <h4>Bu klasörde henüz belge bulunmuyor.</h4>
                      <p>Siz yükleyerek diğer öğretmenlere destek olabilirsiniz.</p>
                    </div>
                  )}
               </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
