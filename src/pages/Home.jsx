import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SearchBar from '../components/SearchBar';
import DocumentCard from '../components/DocumentCard';
import { Sparkles } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Supabase'den gelen verileri UI ile uyumlu hale getir
      const mappedDocs = (data || []).map(doc => ({
        ...doc,
        description: doc.topic,
        uploader: doc.uploaded_by,
        downloads: 0 // Henüz tabloya eklenmediği için statik default
      }));

      setDocuments(mappedDocs);
      setFilteredDocs(mappedDocs);
    } catch (err) {
      console.error('Veritabanından belgeler çekilemedi:', err);
    }
  };

  const handleSearch = ({ searchTerm, format, category }) => {
    if (!searchTerm && format === 'all' && category === 'all') {
      setFilteredDocs(documents);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    let results = documents;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (doc) =>
          doc.title.toLowerCase().includes(term) ||
          doc.description.toLowerCase().includes(term) ||
          doc.uploader.toLowerCase().includes(term)
      );
    }

    if (format !== 'all') {
      results = results.filter((doc) => doc.type.toLowerCase() === format);
    }

    if (category !== 'all') {
      results = results.filter((doc) => doc.category === category);
    }

    setTimeout(() => {
      setFilteredDocs(results);
      setIsSearching(false);
    }, 400);
  };

  const categories = [...new Set(documents.map(doc => doc.category))];
  // İlk 3 belgeyi "Son Eklenenler" olarak al
  const recentDocuments = documents.slice(0, 3);

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
      </section>

      {hasSearched ? (
        <section className="documents-section container animate-fade-in">
          <div className="section-header">
            <h3>
              Arama Sonuçları
              <span className="results-badge">{filteredDocs.length} Belge Bulundu</span>
            </h3>
          </div>

          {isSearching ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Belgeler aranıyor...</p>
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
          {documents.length === 0 ? (
            <div className="empty-state glass-panel">
              <div className="empty-icon">📂</div>
              <h4>Henüz sisteme hiç belge yüklenmedi.</h4>
              <p>Sağ üstten ilk belgeyi yükleyen siz olabilirsiniz.</p>
            </div>
          ) : (
            <>
              {/* SON EKLENEN VİTRİNİ */}
              {recentDocuments.length > 0 && (
                <section className="category-section highlight-section">
                  <div className="section-header">
                    <h3 style={{ color: 'var(--color-primary)' }}>
                      <Sparkles size={24} /> Yeni Yüklenen Belgeler
                      <span className="results-badge" style={{ marginLeft: 'auto' }}>Yeni</span>
                    </h3>
                  </div>
                  
                  <div className="documents-grid">
                    {recentDocuments.map((doc) => (
                      <div key={`recent-${doc.id}`} className="doc-item">
                        <DocumentCard document={doc} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* KATEGORİ LİSTELERİ */}
              {categories.map(category => {
                const docsInCategory = documents.filter(d => d.category === category);
                if (docsInCategory.length === 0) return null;
                
                return (
                  <section key={category} className="category-section">
                    <div className="section-header">
                      <h3>
                        {category} Belgeleri
                        <span className="results-badge">{docsInCategory.length} Belge</span>
                      </h3>
                    </div>
                    
                    <div className="documents-grid documents-horizontal-scroll">
                      {docsInCategory.map((doc) => (
                        <div key={doc.id} className="doc-item">
                          <DocumentCard document={doc} />
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
