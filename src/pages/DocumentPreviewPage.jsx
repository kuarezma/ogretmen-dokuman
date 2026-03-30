import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Eye, Calendar, User, ExternalLink, Play, Key } from 'lucide-react';
import { supabase } from '../supabaseClient';

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

const DocumentAnswerKeyBlock = ({ document: doc }) => {
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const hasAnswerKey = Boolean(doc.answer_key_text);
  if (!hasAnswerKey) return null;
  return (
    <>
      <button className="btn btn-outline" onClick={() => setShowAnswerKey(prev => !prev)} style={{ display: 'inline-flex' }}>
        <Key size={14} /> {showAnswerKey ? 'Anahtarı Gizle' : 'Cevap Anahtarı'}
      </button>
      {showAnswerKey && (
        <div className="glass-panel" style={{ padding: '1rem', width: '100%', flexBasis: '100%' }}>
          <div style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>Cevap Anahtarı</div>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{doc.answer_key_text}</pre>
        </div>
      )}
    </>
  );
};

const DocumentPreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [document, setDocument] = useState(location.state?.document || null);
  const [loading, setLoading] = useState(!location.state?.document);

  useEffect(() => {
    const loadDocument = async () => {
      if (document) return;
      setLoading(true);
      const { data, error } = await supabase.from('documents').select('*').eq('id', id).single();
      if (!error && data) setDocument(data);
      setLoading(false);
    };

    loadDocument();
  }, [id, document]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <div style={{ color: 'var(--color-text-muted)' }}>Yükleniyor...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem', textAlign: 'center' }}>
        <div>
          <h2>Belge bulunamadı</h2>
          <button className="btn btn-primary" onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const youtubeId = getYouTubeId(document.file_url);
  const driveId = getDriveId(document.file_url);
  const drivePreviewUrl = driveId ? `https://drive.google.com/file/d/${driveId}/preview` : null;
  const isPdf = document.file_url?.toLowerCase().includes('.pdf');
  const isWord = document.file_url?.toLowerCase().includes('.doc');
  const isExcel = document.file_url?.toLowerCase().includes('.xls');
  const officeViewerUrl = document.file_url
    ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(document.file_url)}`
    : null;
  const hasSolution = Boolean(document.solution_url);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ padding: '0.5rem 0.75rem' }}>
          <ArrowLeft size={18} /> Geri
        </button>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{document.title}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{document.topic}</div>
        </div>
      </div>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ minHeight: '60vh', maxHeight: '72vh', overflow: 'auto', background: 'var(--color-background)' }}>
            {youtubeId ? (
              <iframe src={`https://www.youtube.com/embed/${youtubeId}`} style={{ width: '100%', height: '60vh', border: 'none' }} title={document.title} allowFullScreen />
            ) : drivePreviewUrl ? (
              <iframe src={drivePreviewUrl} style={{ width: '100%', height: '60vh', border: 'none' }} title={document.title} />
            ) : isPdf ? (
              <iframe src={document.file_url} style={{ width: '100%', height: '60vh', border: 'none' }} title={document.title} />
            ) : (isWord || isExcel) && officeViewerUrl ? (
              <iframe src={officeViewerUrl} style={{ width: '100%', height: '60vh', border: 'none' }} title={document.title} />
            ) : document.file_url ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <Play size={32} color="var(--color-primary)" />
                <p style={{ margin: '1rem 0' }}>Bu dosya türü önizlenemiyor</p>
                <a href={document.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                  <ExternalLink size={16} /> Dosyayı Aç
                </a>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <Eye size={32} color="var(--color-text-muted)" />
                <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Bu belge için dosya bağlantısı bulunmuyor</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {document.grade && <span className="category-badge">{document.grade}</span>}
            {document.lesson && <span className="category-badge">{document.lesson}</span>}
            <span className="category-badge">{document.category}</span>
            {hasSolution && <span className="category-badge" style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>Çözümlü</span>}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <DocumentAnswerKeyBlock key={document.id} document={document} />
            {hasSolution && (
              <a href={document.solution_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                <ExternalLink size={14} /> Çözüm PDF
              </a>
            )}
            {document.file_url && (
              <a href={document.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'inline-flex' }}>
                <Download size={14} /> İndir
              </a>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
            {document.uploader && <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><User size={14} /> {document.uploader}</span>}
            {document.created_at && <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={14} /> {new Date(document.created_at).toLocaleDateString('tr-TR')}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewPage;
