import React, { useState } from 'react';
import { Search, Globe, Database } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [format, setFormat] = useState('all');
  const [category, setCategory] = useState('all');
  const [searchType, setSearchType] = useState('internal'); // 'internal' or 'google'

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchType === 'google') {
      // Google'da Arama Yap (Yeni sekmede)
      // Site içi aramaları Google üzerinden yapmak için 'site:...' eklenebilir
      // Fakat genel google araması istendiyse direkt aratıyoruz
      const query = encodeURIComponent(`${searchTerm} öğretmen belge eğitim`);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    } else {
      // Site içi arama
      onSearch({ searchTerm, format, category });
    }
  };

  return (
    <div className="search-container glass-panel animate-fade-in">
      
      <div className="search-type-toggle">
        <button 
          className={`toggle-btn ${searchType === 'internal' ? 'active' : ''}`}
          onClick={() => setSearchType('internal')}
          type="button"
        >
          <Database size={16} /> Site İçi Ara
        </button>
        <button 
          className={`toggle-btn ${searchType === 'google' ? 'active' : ''}`}
          onClick={() => setSearchType('google')}
          type="button"
        >
          <Globe size={16} /> Google'da Ara
        </button>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder={
              searchType === 'internal' 
                ? "Ne aramak istersiniz? (Örn: 9. Sınıf Kimya Yazılı)" 
                : "Google üzerinde arayın (Yeni sekmede açılır)"
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            required
          />
        </div>
        
        {searchType === 'internal' && (
          <div className="filters-wrapper animate-fade-in">
            <div className="filter-group">
              <select 
                value={format} 
                onChange={(e) => setFormat(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tüm Formatlar</option>
                <option value="word">Word Belgesi (.doc, .docx)</option>
                <option value="excel">Excel Klasörü (.xls, .xlsx)</option>
                <option value="pdf">PDF Dosyası (.pdf)</option>
              </select>
            </div>
            
            <div className="filter-group">
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="Yazılı">Yazılı Soruları</option>
                <option value="Test">Deneme / Test</option>
                <option value="Yıllık Plan">Yıllık Planlar</option>
                <option value="Proje">Proje / Etkinlik</option>
              </select>
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary search-btn">
          {searchType === 'internal' ? 'Bul' : 'Google\'da Ara'}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
