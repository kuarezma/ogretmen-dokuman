import React, { useEffect, useState } from 'react';
import { X, Download, Eye, Calendar, User, ExternalLink, Play, Key } from 'lucide-react';
import './DocumentPreviewModal.css';

const DocumentPreviewModal = ({ document, isOpen, onClose }) => {
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const doc = document || {};

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

  const youtubeId = getYouTubeId(doc.file_url);
  const driveId = getDriveId(doc.file_url);
  const drivePreviewUrl = driveId ? `https://drive.google.com/file/d/${driveId}/preview` : null;
  const isPdf = doc.file_url?.toLowerCase().includes('.pdf');
  const isWord = doc.file_url?.toLowerCase().includes('.doc');
  const isExcel = doc.file_url?.toLowerCase().includes('.xls');
  const officeViewerUrl = doc.file_url
    ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(doc.file_url)}`
    : null;
  const isThirdPartyFile = doc.file_url && !doc.file_url.includes('supabase.co') && !driveId;
  const hasAnswerKey = Boolean(doc.answer_key_text);
  const hasSolution = Boolean(doc.solution_url);

  useEffect(() => {
    if (!isOpen || !document) return;
    setShowAnswerKey(false);
  }, [isOpen, document?.id]);

  if (!isOpen || !document) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        boxShadow: 'var(--shadow-xl)'
        }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
              {doc.title}
            </h2>
            {doc.topic && (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {doc.topic}
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

        <div className="preview-modal-body" style={{ flex: 1, overflow: 'auto', background: 'var(--color-background)', minHeight: '400px' }}>
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              style={{ width: '100%', height: '100%', minHeight: '400px', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={doc.title}
            />
          ) : drivePreviewUrl ? (
            <iframe
              src={drivePreviewUrl}
              style={{ width: '100%', height: '100%', minHeight: '400px', border: 'none' }}
              title={doc.title}
            />
          ) : isPdf ? (
            <iframe
              src={doc.file_url}
              style={{ width: '100%', height: '100%', minHeight: '400px', border: 'none' }}
              title={doc.title}
            />
          ) : (isWord || isExcel) && officeViewerUrl ? (
            <iframe
              src={officeViewerUrl}
              style={{ width: '100%', height: '100%', minHeight: '400px', border: 'none' }}
              title={doc.title}
            />
          ) : doc.file_url ? (
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
                href={doc.file_url}
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

        <div className="preview-modal-footer" style={{
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
            {doc.grade && (
              <span style={{
                padding: '0.25rem 0.75rem',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                borderRadius: 'var(--radius-full)',
                fontWeight: '500'
              }}>
              {doc.grade}
              </span>
            )}
            {doc.lesson && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <User size={14} /> {doc.lesson}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Calendar size={14} /> {formatDate(doc.created_at)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {hasAnswerKey && (
              <button
                type="button"
                onClick={() => setShowAnswerKey(prev => !prev)}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'inline-flex' }}
              >
                <Key size={14} /> {showAnswerKey ? 'Anahtarı Gizle' : 'Cevap Anahtarı'}
              </button>
            )}
            {hasSolution && (
              <a
                href={doc.solution_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'inline-flex' }}
              >
                <ExternalLink size={14} /> Çözüm PDF
              </a>
            )}
            {doc.download_count > 0 && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)'
              }}>
                <Download size={14} /> {doc.download_count}
              </span>
            )}
            {doc.file_url && (
              <a
                href={doc.file_url}
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

        {showAnswerKey && hasAnswerKey && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-surface-hover)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              color: 'var(--color-primary)',
              fontWeight: '600'
            }}>
              <Key size={16} /> Cevap Anahtarı
            </div>
            <pre style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              color: 'var(--color-text)'
            }}>
              {doc.answer_key_text}
            </pre>
          </div>
        )}

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

        {doc.description && (
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
              {doc.description}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default DocumentPreviewModal;
