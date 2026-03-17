import React, { useState } from 'react';
import { Search, Globe, Database } from 'lucide-react';
import './SearchBar.css';

const GRADE_LESSONS = {
  "Tüm Sınıflar": ["Tüm Dersler"],
  "Okul Öncesi": ["Tüm Dersler", "Oyun ve Etkinlik", "Boyama", "Masal / Hikaye", "Diğer"],
  "1. Sınıf": ["Tüm Dersler", "Okuma Yazma Öğreniyorum", "Matematik", "Hayat Bilgisi", "Müzik", "Görsel Sanatlar", "Beden Eğitimi", "Diğer"],
  "2. Sınıf": ["Tüm Dersler", "Türkçe", "Matematik", "Hayat Bilgisi", "İngilizce", "Görsel Sanatlar", "Müzik", "Beden Eğitimi", "Diğer"],
  "3. Sınıf": ["Tüm Dersler", "Türkçe", "Matematik", "Hayat Bilgisi", "Fen Bilimleri", "İngilizce", "Görsel Sanatlar", "Müzik", "Beden Eğitimi", "Diğer"],
  "4. Sınıf": ["Tüm Dersler", "Türkçe", "Matematik", "Fen Bilimleri", "Sosyal Bilgiler", "İngilizce", "Din Kültürü", "İnsan Hakları", "Görsel Sanatlar", "Müzik", "Diğer"],
  "5. Sınıf": ["Tüm Dersler", "Türkçe", "Matematik", "Fen Bilimleri", "Sosyal Bilgiler", "İngilizce", "Din Kültürü", "Bilişim Teknolojileri", "Müzik", "Görsel Sanatlar", "Seçmeli Dersler", "Diğer"],
  "6. Sınıf": ["Tüm Dersler", "Türkçe", "Matematik", "Fen Bilimleri", "Sosyal Bilgiler", "İngilizce", "Din Kültürü", "Bilişim Teknolojileri", "Müzik", "Görsel Sanatlar", "Seçmeli Dersler", "Diğer"],
  "7. Sınıf": ["Tüm Dersler", "Türkçe", "Matematik", "Fen Bilimleri", "Sosyal Bilgiler", "İngilizce", "Din Kültürü", "Teknoloji ve Tasarım", "Görsel Sanatlar", "Müzik", "Seçmeli Dersler", "Diğer"],
  "8. Sınıf": ["Tüm Dersler", "Türkçe", "Matematik", "Fen Bilimleri", "T.C. İnkılap Tarihi", "İngilizce", "Din Kültürü", "Teknoloji ve Tasarım", "Görsel Sanatlar", "Müzik", "Seçmeli Dersler", "Diğer"],
  "9. Sınıf": ["Tüm Dersler", "Türk Dili ve Edebiyatı", "Matematik", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "İngilizce", "Almanca", "Din Kültürü", "Meslek Dersleri", "Diğer"],
  "10. Sınıf": ["Tüm Dersler", "Türk Dili ve Edebiyatı", "Matematik", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "Felsefe", "İngilizce", "Almanca", "Din Kültürü", "Meslek Dersleri", "Diğer"],
  "11. Sınıf": ["Tüm Dersler", "Türk Dili ve Edebiyatı", "Matematik", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "Felsefe", "İngilizce", "Almanca", "Din Kültürü", "Meslek Dersleri", "Diğer"],
  "12. Sınıf": ["Tüm Dersler", "Türk Dili ve Edebiyatı", "Matematik", "Fizik", "Kimya", "Biyoloji", "T.C. İnkılap Tarihi", "Coğrafya", "İngilizce", "Almanca", "Din Kültürü", "Meslek Dersleri", "Diğer"],
  "Genel / Ortak": ["Tüm Dersler", "Klavuzlar", "Yönetmelikler", "Rehberlik", "Sınıf Öğretmenliği", "ŞÖK Toplantıları", "Veli Toplantıları", "Diğer"]
};

const DOC_CATEGORIES = ["Tüm Kategoriler", "Yazılı Soruları", "Deneme / Test", "Yıllık Plan", "Günlük Plan", "Proje / Performans", "Zümre Tutanakları", "Etkinlik / Çalışma Kağıdı", "Sunum (Slayt)", "Diğer"];

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [format, setFormat] = useState('all');
  const [grade, setGrade] = useState('Tüm Sınıflar');
  const [lesson, setLesson] = useState('Tüm Dersler');
  const [category, setCategory] = useState('Tüm Kategoriler');
  const [searchType, setSearchType] = useState('internal');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchType === 'google') {
      const query = encodeURIComponent(`${searchTerm} öğretmen belge eğitim`);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    } else {
      // Yenilenmiş parametreleri yolla
      onSearch({ searchTerm, format, grade, lesson, category });
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
                value={grade} 
                onChange={(e) => {
                  setGrade(e.target.value);
                  setLesson(GRADE_LESSONS[e.target.value][0]);
                }}
                className="filter-select"
              >
                {Object.keys(GRADE_LESSONS).map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select 
                value={lesson} 
                onChange={(e) => setLesson(e.target.value)}
                className="filter-select"
                disabled={grade === 'Tüm Sınıflar'}
              >
                {GRADE_LESSONS[grade].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="filter-select"
              >
                {DOC_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        <button type="submit" className="btn btn-primary search-btn">
          {searchType === 'google' ? 'Google\'da Bul' : 'Bul'}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
