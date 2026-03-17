import React from 'react';
import { Search, Filter, FileText, Download, User as UserIcon, Calendar } from 'lucide-react';
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

  const handleDownload = () => {
    // Mock download action
    alert(`${document.title} indiriliyor...`);
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
        
        <button className="btn btn-primary btn-sm dl-btn" onClick={handleDownload}>
          <Download size={16} /> İndir
          <span className="dl-count">({document.downloads})</span>
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
