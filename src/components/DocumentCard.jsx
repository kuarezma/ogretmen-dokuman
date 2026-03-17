import React from 'react';
import { Search, Filter, FileText, Download, User as UserIcon, Calendar, Eye } from 'lucide-react';
import './DocumentCard.css';

const DocumentCard = ({ document }) => {
  const getIconColor = (type) => {
    switch (type.toLowerCase()) {
      case 'word': return 'var(--color-doc-word)';
      case 'excel': return 'var(--color-doc-excel)';
      case 'pdf': return 'var(--color-doc-pdf)';
      default: return 'var(--color-primary)';
    }
  };

  const getFormatBadge = (type) => {
    return (
      <span className={`format-badge format-${type.toLowerCase()}`}>
        {type.toUpperCase()}
      </span>
    );
  };

  const handlePreview = () => {
    if (!document.file_url) {
      alert("Bu belgenin dosyası henüz yüklenmemiş.");
      return;
    }
    
    // PDF ise direkt açılır, Word/Excel ise Office Online Viewer ile açılır
    if (document.type.toLowerCase() === 'pdf') {
       window.open(document.file_url, '_blank');
    } else {
       const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(document.file_url)}`;
       window.open(viewerUrl, '_blank');
    }
  };

  const handleDownload = () => {
    if (!document.file_url) {
      alert("Bu belgenin dosyası henüz yüklenmemiş.");
      return;
    }
    // İndirme işlemini simüle etmek yerine direkt dosyayı yeni sekmede de açtırabiliriz
    // veya indirme linki olarak kullanabiliriz. (Supabase public URL direkt indirmeye de zorlanabilir)
    window.open(document.file_url, '_blank');
  };

  return (
    <div className="doc-card glass-panel animate-fade-in delay-100">
      <div className="doc-card-header">
        <div className="doc-icon" style={{ color: getIconColor(document.type) }}>
          <FileText size={32} />
        </div>
        <div className="doc-meta-top">
          {getFormatBadge(document.type)}
          <span className="category-badge">{document.category}</span>
        </div>
      </div>
      
      <div className="doc-card-body">
        <h3 className="doc-title">{document.title}</h3>
        <p className="doc-desc">{document.description}</p>
      </div>
      
      <div className="doc-card-footer">
        <div className="doc-info">
          <div className="info-item">
            <UserIcon size={14} />
            <span>{document.uploader}</span>
          </div>
          <div className="info-item">
            <Calendar size={14} />
            <span>{document.date}</span>
          </div>
        </div>
        
        <div className="doc-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline btn-sm dl-btn" onClick={handlePreview} style={{ padding: '0.5rem' }}>
            <Eye size={16} /> Önizle
          </button>
          <button className="btn btn-primary btn-sm dl-btn" onClick={handleDownload} style={{ padding: '0.5rem' }}>
            <Download size={16} /> İndir
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
