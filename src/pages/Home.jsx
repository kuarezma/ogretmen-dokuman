import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import SearchBar from '../components/SearchBar';
import DocumentCard from '../components/DocumentCard';
import { Sparkles, Folder, Plus } from 'lucide-react';
import Leaderboard from '../components/Leaderboard';
import CalendarWidget from '../components/CalendarWidget';
import LatestForumPosts from '../components/LatestForumPosts';
import AuthModal from '../components/AuthModal';
import QuickAddModal from '../components/QuickAddModal';
import DocumentPreviewModal from '../components/DocumentPreviewModal';
import FolderSystem from '../components/FolderSystem';
import './Home.css';

const LEGACY_TEST_CATEGORY = 'Deneme / Test';
const DOC_CATEGORIES = [
  'Yazılı Soruları', 'Deneme Sınavı', 'Yaprak Test', 'Yıllık Plan', 'Günlük Plan',
  'Proje / Performans', 'Zümre Tutanakları', 'Etkinlik / Çalışma Kağıdı',
  'Sunum (Slayt)', 'Diğer'
];

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

const normalizeCategory = (doc, docs = []) => {
  if (doc.category !== LEGACY_TEST_CATEGORY) return doc.category;
  const haystack = `${doc.title || ''} ${doc.topic || ''} ${doc.file_name || ''}`.toLowerCase();
  if (haystack.includes('yaprak')) return 'Yaprak Test';
  if (haystack.includes('deneme') || haystack.includes('sinav') || haystack.includes('sınav')) return 'Deneme Sınavı';
  const latestLegacyDoc = [...docs]
    .filter(item => item.category === LEGACY_TEST_CATEGORY)
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0];
  return latestLegacyDoc && latestLegacyDoc.id === doc.id ? 'Yaprak Test' : 'Deneme Sınavı';
};

const normalizeDocuments = (docs = []) => docs.map(doc => ({
  ...doc,
  category: normalizeCategory(doc, docs),
  description: doc.topic,
  uploader: doc.uploaded_by,
  downloads: doc.download_count || 0
}));

const Home = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [user, setUser] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Kategori Hiyerarşisi State Yönetimi
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

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const mappedDocs = normalizeDocuments(data || []);
      setDocuments(mappedDocs);
      setFilteredDocs(mappedDocs);
    } catch (err) {
      console.error('Veritabanından belgeler çekilemedi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAddSuccess = useCallback((newDoc) => {
    if (!newDoc) return;
    const normalizedDoc = {
      ...newDoc,
      description: newDoc.topic,
      uploader: newDoc.uploaded_by,
      downloads: newDoc.download_count || 0
    };
    setDocuments(prev => [normalizedDoc, ...prev]);
    setFilteredDocs(prev => [normalizedDoc, ...prev]);
  }, []);

  const handleSearch = async ({ searchTerm, format, grade, lesson, category, dateRange = 'all' }) => {
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
      if (format !== 'all') query = query.eq('type', format);
      if (grade && grade !== 'Tüm Sınıflar') query = query.eq('grade', grade);
      if (lesson && lesson !== 'Tüm Dersler') query = query.eq('lesson', lesson);
      
      if (category && category !== 'Tüm Kategoriler') {
        if (category === 'Deneme Sınavı' || category === 'Yaprak Test') {
          query = query.in('category', [category, LEGACY_TEST_CATEGORY]);
        } else {
          query = query.eq('category', category);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      setFilteredDocs(normalizeDocuments(data || []));
    } catch (err) {
      console.error("Arama sırasında hata:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Kategori Tıklama Fonksiyonları
  const handleGradeClick = useCallback((gradeName) => {
    setCurrentPath({ grade: gradeName, lesson: null, category: null });
    setFolderLevel(1);
  }, []);

  const handleLessonClick = useCallback((lessonName) => {
    setCurrentPath(prev => ({ ...prev, lesson: lessonName }));
    setFolderLevel(2);
  }, []);

  const handleCategoryClick = useCallback((categoryName) => {
    setCurrentPath(prev => ({ ...prev, category: categoryName }));
    setFolderLevel(3);
  }, []);

  const resetToHome = useCallback(() => {
    setFolderLevel(0);
    setCurrentPath({ grade: null, lesson: null, category: null });
  }, []);

  const handleGoBack = useCallback(() => {
    setFolderLevel(prev => Math.max(0, prev - 1));
    setCurrentPath(prev => {
      const newPath = { ...prev };
      if (folderLevel === 3) newPath.category = null;
      else if (folderLevel === 2) newPath.lesson = null;
      else if (folderLevel === 1) newPath.grade = null;
      return newPath;
    });
  }, [folderLevel]);

  // Nihai Klasör İçeriği (Level 3)
  const pathFilteredDocs = useMemo(() => {
    if (folderLevel !== 3) return [];
    return documents.filter(doc => 
      doc.grade === currentPath.grade && 
      doc.lesson === currentPath.lesson && 
      doc.category === currentPath.category
    );
  }, [documents, folderLevel, currentPath]);

  const recentDocuments = useMemo(() => documents.slice(0, 3), [documents]);

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
        
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            onClick={() => user ? setShowQuickAdd(true) : setIsAuthOpen(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', gap: '0.5rem' }}
          >
            <Plus size={18} /> Belge Yükle
          </button>
        </div>
      </section>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        isLoginView={true}
        onLoginSuccess={() => { checkUser(); setIsAuthOpen(false); setShowQuickAdd(true); }}
      />

      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSuccess={handleQuickAddSuccess}
      />

      <DocumentPreviewModal
        key={previewDoc?.id ?? 'closed'}
        document={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

      <div className="categories-container container">
        {hasSearched ? (
          <section className="documents-section animate-fade-in">
            <div className="section-header">
              <h3>Arama Sonuçları <span className="results-badge">{filteredDocs.length} Belge</span></h3>
            </div>
            <div className="documents-grid">
              {isSearching ? [1,2,3].map(i => <div key={i} className="skeleton-card" />) : 
                filteredDocs.map(doc => <DocumentCard key={doc.id} document={doc} />)}
            </div>
          </section>
        ) : (
          <>
            {folderLevel === 0 ? (
              <>
                <section className="category-section highlight-section" style={{ marginBottom: '2.5rem' }}>
                   <div className="section-header">
                    <h3 style={{ color: 'var(--color-primary)' }}>
                      <Sparkles size={24} /> Yeni Yüklenen Belgeler
                    </h3>
                  </div>
                  <div className="documents-grid">
                    {isLoading ? [1,2,3].map(i => <div key={i} className="skeleton-card" />) : 
                      recentDocuments.map(doc => <DocumentCard key={doc.id} document={doc} />)}
                  </div>
                </section>

                <div className="grade-sections">
                  {/* Preschool, Primary, Middle, High sections can be mapped here or kept semantic */}
                  <section className="category-section">
                    <h4 className="grade-title preschool">Okul Öncesi</h4>
                    <div className="folder-grid">
                      <div onClick={() => handleGradeClick("Okul Öncesi")} className="folder-card glass-panel hover-effect folder-preschool">
                        <Folder size={40} className="folder-icon pink" /><h4>Okul Öncesi</h4>
                      </div>
                    </div>
                  </section>

                  <section className="category-section">
                    <h4 className="grade-title primary">İlkokul (1-4. Sınıflar)</h4>
                    <div className="folder-grid">
                      {["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"].map(grade => (
                        <div key={grade} onClick={() => handleGradeClick(grade)} className="folder-card glass-panel hover-effect folder-primary">
                          <Folder size={40} className="folder-icon green" /><h4>{grade}</h4>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="category-section">
                    <h4 className="grade-title middle">Ortaokul (5-8. Sınıflar)</h4>
                    <div className="folder-grid">
                      {["5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf"].map(grade => (
                        <div key={grade} onClick={() => handleGradeClick(grade)} className="folder-card glass-panel hover-effect folder-middle">
                          <Folder size={40} className="folder-icon blue" /><h4>{grade}</h4>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="category-section">
                    <h4 className="grade-title high">Lise (9-12. Sınıflar)</h4>
                    <div className="folder-grid">
                      {["9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf"].map(grade => (
                        <div key={grade} onClick={() => handleGradeClick(grade)} className="folder-card glass-panel hover-effect folder-high">
                          <Folder size={40} className="folder-icon purple" /><h4>{grade}</h4>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="category-section">
                    <h4 className="grade-title general">Genel / Ortak</h4>
                    <div className="folder-grid">
                      <div onClick={() => handleGradeClick("Genel / Ortak")} className="folder-card glass-panel hover-effect folder-general">
                        <Folder size={40} className="folder-icon orange" /><h4>Genel / Ortak</h4>
                      </div>
                    </div>
                  </section>
                </div>
              </>
            ) : (
              <FolderSystem 
                folderLevel={folderLevel}
                currentPath={currentPath}
                onGradeClick={handleGradeClick}
                onLessonClick={handleLessonClick}
                onCategoryClick={handleCategoryClick}
                onGoBack={handleGoBack}
                onReset={resetToHome}
                gradeLessons={GRADE_LESSONS}
                docCategories={DOC_CATEGORIES}
              />
            )}

            {folderLevel === 3 && (
              <section className="category-details animate-fade-in">
                <div className="documents-grid">
                  {pathFilteredDocs.length > 0 ? 
                    pathFilteredDocs.map(doc => <DocumentCard key={doc.id} document={doc} />) :
                    <div className="empty-state glass-panel">📝 <h4>Belge bulunmuyor. İlk yükleyen siz olun!</h4></div>
                  }
                </div>
              </section>
            )}

            {folderLevel === 0 && (
              <>
                <LatestForumPosts />
                <div className="bottom-widgets">
                  <Leaderboard />
                  <CalendarWidget />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
