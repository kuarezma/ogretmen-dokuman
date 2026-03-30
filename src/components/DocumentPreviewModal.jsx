import React from 'react';
import { X, Download, Eye, Calendar, User, ExternalLink, Play } from 'lucide-react';

const DocumentPreviewModal = ({ document, isOpen, onClose }) => {
  if (!isOpen || !document) return null;

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getDriveId = (url) => {
    if (!url) return null;
    const patterns = [
      /drive\.google\.com\/file\/d\/([^/?]+)/,
      /drive\.google\.com\/open\?id=([^&]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const youtubeId = getYouTubeId(document.file_url);
  const driveId = getDriveId(document.file_url);
  const isDriveFile = Boolean(driveId);
  const isPdf = document.file_url?.toLowerCase().includes('.pdf');
  const isWord = document.file_url?.toLowerCase().includes('.doc');
  const isExcel = document.file_url?.toLowerCase().includes('.xls');
  const officeViewerUrl = document.file_url
    ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(document.file_url)}`
    : null;
  const isThirdPartyFile = document.file_url && !document.file_url.includes('supabase.co');

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
              {document.title}
            </h2>
            {document.topic && (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {document.topic}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-background)', minHeight: '400px' }}>
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              style={{ width: '100%', height: '100%', minHeight: '400px', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={document.title}
            />
          ) : isPdf && isDriveFile ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '400px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <ExternalLink size={32} color="var(--color-primary)" />
              </div>
              <p style={{ color: 'var(--color-text)', marginBottom: '1rem' }}>
                Google Drive belgelerini en güvenilir şekilde yeni sekmede açıyoruz.
              </p>
              <a
                href={document.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex' }}
              >
                <ExternalLink size={16} /> Google Drive'da Aç
              </a>
            </div>
          ) : isPdf ? (
            <iframe
              src={document.file_url}
              style={{ width: '100%', height: '100%', minHeight: '400px', border: 'none' }}
              title={document.title}
            />
          ) : driveId ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '400px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <ExternalLink size={32} color="var(--color-primary)" />
              </div>
              <p style={{ color: 'var(--color-text)', marginBottom: '1rem' }}>
                Google Drive dosyasini site içinde önizlemek yerine yeni sekmede açıyoruz.
              </p>
              <a
                href={document.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex' }}
              >
                <ExternalLink size={16} /> Google Drive'da Aç
              </a>
            </div>
          ) : (isWord || isExcel) && officeViewerUrl ? (
            <iframe
              src={officeViewerUrl}
              style={{ width: '100%', height: '100%', minHeight: '400px', border: 'none' }}
              title={document.title}
            />
          ) : document.file_url ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '400px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Play size={32} color="var(--color-primary)" />
              </div>
              <p style={{ color: 'var(--color-text)', marginBottom: '1rem' }}>
                Bu dosya türü önizlenemiyor
              </p>
              <a
                href={document.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex' }}
              >
                <ExternalLink size={16} /> Dosyayı Aç
              </a>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '400px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--color-surface-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Eye size={32} color="var(--color-text-muted)" />
              </div>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Bu belge için dosya bağlantısı bulunmuyor
              </p>
            </div>
          )}
        </div>

        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)'
          }}>
            {document.grade && (
              <span style={{
                padding: '0.25rem 0.75rem',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                borderRadius: 'var(--radius-full)',
                fontWeight: '500'
              }}>
                {document.grade}
              </span>
            )}
            {document.lesson && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <User size={14} /> {document.lesson}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Calendar size={14} /> {formatDate(document.created_at)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {document.download_count > 0 && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)'
              }}>
                <Download size={14} /> {document.download_count}
              </span>
            )}
            {document.file_url && (
              <a
                href={document.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                <Download size={14} /> İndir
              </a>
            )}
          </div>
        </div>

        {isThirdPartyFile && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-border)',
            background: 'rgba(245, 158, 11, 0.12)',
            color: 'var(--color-text)',
            fontSize: '0.9rem',
            lineHeight: '1.5'
          }}>
            Harici bağlantı ile eklenen dosyalarda önizleme ancak bağlantı herkese açıksa çalışır. Erişim uyarısı görüyorsanız dosyayı herkese açık paylaşın veya siteye doğrudan yükleyin.
          </div>
        )}

        {document.description && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-surface-hover)'
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
              lineHeight: '1.5'
            }}>
              {document.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
