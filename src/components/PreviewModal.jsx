import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, FileText, Image as ImageIcon, Loader } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';
import './PreviewModal.css';

const PreviewModal = ({ isOpen, onClose, document }) => {
  const [downloadCount, setDownloadCount] = useState(document?.download_count || 0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setCurrentPage(1);
      setZoom(1);
    }
  }, [isOpen, document?.id]);

  if (!isOpen || !document) return null;

  const getFileType = () => {
    const type = document.type?.toLowerCase() || '';
    const url = document.file_url?.toLowerCase() || '';
    
    if (type === 'pdf' || url.includes('.pdf')) return 'pdf';
    if (type.includes('word') || type.includes('doc') || url.includes('.doc')) return 'word';
    if (type.includes('excel') || type.includes('xls') || url.includes('.xls')) return 'excel';
    if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp')) return 'image';
    return 'unknown';
  };

  const fileType = getFileType();

  const handleDownload = async () => {
    if (!document.file_url) {
      toast.error("Dosya mevcut değil.");
      return;
    }
    
    setIsDownloading(true);
    try {
      await supabase
        .from('documents')
        .update({ download_count: (downloadCount || 0) + 1 })
        .eq('id', document.id);
      
      setDownloadCount(prev => (prev || 0) + 1);
      
      const link = document.createElement('a');
      link.href = document.file_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = document.title || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('İndirme başladı!');
    } catch {
      window.open(document.file_url, '_blank');
      toast.success('İndirme başladı!');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderPreview = () => {
    if (!document.file_url) {
      return (
        <div className="preview-no-file">
          <FileText size={64} color="var(--color-text-muted)" />
          <h3>Dosya Mevcut Değil</h3>
          <p>Bu belge için henüz dosya yüklenmemiş.</p>
        </div>
      );
    }

    if (fileType === 'pdf') {
      return (
        <div className="preview-pdf-container">
          {isLoading && (
            <div className="preview-loading">
              <Loader className="spin" size={40} />
              <p>PDF yükleniyor...</p>
            </div>
          )}
          <iframe
            src={`${document.file_url}#page=${currentPage}`}
            className="preview-iframe"
            title={document.title}
            onLoad={() => setIsLoading(false)}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          />
        </div>
      );
    }

    if (fileType === 'image') {
      return (
        <div className="preview-image-container">
          {isLoading && (
            <div className="preview-loading">
              <Loader className="spin" size={40} />
              <p>Görsel yükleniyor...</p>
            </div>
          )}
          <img
            src={document.file_url}
            alt={document.title}
            className="preview-image"
            onLoad={() => setIsLoading(false)}
            style={{ transform: `scale(${zoom})` }}
          />
        </div>
      );
    }

    if (fileType === 'word' || fileType === 'excel') {
      const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(document.file_url)}`;
      return (
        <div className="preview-office-container">
          {isLoading && (
            <div className="preview-loading">
              <Loader className="spin" size={40} />
              <p>Office belgesi yükleniyor...</p>
            </div>
          )}
          <iframe
            src={viewerUrl}
            className="preview-iframe"
            title={document.title}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      );
    }

    return (
      <div className="preview-unsupported">
        <FileText size={64} color="var(--color-text-muted)" />
        <h3>Önizleme Desteklenmiyor</h3>
        <p>Bu dosya türü için önizleme mevcut değil.</p>
        <button className="btn btn-primary" onClick={handleDownload}>
          <Download size={18} /> İndir
        </button>
      </div>
    );
  };

  return (
    <div className="preview-modal-backdrop" onClick={handleBackdropClick}>
      <div className="preview-modal glass-panel">
        <div className="preview-header">
          <div className="preview-title">
            <h2>{document.title}</h2>
            <span className={`format-badge format-${fileType}`}>{fileType.toUpperCase()}</span>
          </div>
          <div className="preview-actions">
            <button 
              className="btn btn-outline btn-sm" 
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? <Loader className="spin" size={16} /> : <Download size={16} />}
              İndir {downloadCount > 0 && `(${downloadCount})`}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {fileType === 'pdf' && (
          <div className="preview-toolbar">
            <div className="zoom-controls">
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                disabled={zoom <= 0.5}
              >
                <ZoomOut size={18} />
              </button>
              <span className="zoom-level">{Math.round(zoom * 100)}%</span>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setZoom(z => Math.min(2, z + 0.25))}
                disabled={zoom >= 2}
              >
                <ZoomIn size={18} />
              </button>
            </div>
            <div className="page-controls">
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft size={18} />
              </button>
              <span>Sayfa {currentPage}</span>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="preview-content">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
