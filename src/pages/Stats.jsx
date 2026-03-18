import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { TrendingUp, Download, FileText, Heart, Users } from 'lucide-react';

const Stats = () => {
  const [topDocuments, setTopDocuments] = useState([]);
  const [topUploaders, setTopUploaders] = useState([]);
  const [totalStats, setTotalStats] = useState({ docs: 0, likes: 0, comments: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // En çok indirilen belgeler
      const { data: docs } = await supabase
        .from('documents')
        .select('id, title, uploaded_by, type, category, download_count, grade, lesson')
        .order('download_count', { ascending: false })
        .limit(10);

      // En aktif yükleyiciler (belge sayısına göre)
      const { data: allDocs } = await supabase
        .from('documents')
        .select('uploaded_by');

      // Toplam istatistikler
      const { count: docCount } = await supabase
        .from('documents')
        .select('id', { count: 'exact', head: true });

      const { count: likeCount } = await supabase
        .from('likes')
        .select('id', { count: 'exact', head: true });

      const { count: commentCount } = await supabase
        .from('document_comments')
        .select('id', { count: 'exact', head: true });

      setTopDocuments(docs || []);
      setTotalStats({ docs: docCount || 0, likes: likeCount || 0, comments: commentCount || 0 });

      // Yükleyici sayısını hesapla
      if (allDocs) {
        const counts = {};
        allDocs.forEach(d => { counts[d.uploaded_by] = (counts[d.uploaded_by] || 0) + 1; });
        const sorted = Object.entries(counts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));
        setTopUploaders(sorted);
      }
    } catch (err) {
      console.error("İstatistikler yüklenemedi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type) => {
    if (!type) return '#64748b';
    const t = type.toLowerCase();
    if (t.includes('word') || t.includes('doc')) return '#2563eb';
    if (t.includes('excel') || t.includes('xls')) return '#16a34a';
    if (t.includes('pdf')) return '#dc2626';
    return '#64748b';
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingUp size={32} color="var(--color-primary)" />
          Platform İstatistikleri
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
          Platformdaki en popüler içerikler ve aktif öğretmenler
        </p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          İstatistikler yükleniyor...
        </div>
      ) : (
        <>
          {/* Özet Kartlar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            {[
              { label: 'Toplam Belge', value: totalStats.docs, icon: <FileText size={28} />, color: 'var(--color-primary)' },
              { label: 'Toplam Beğeni', value: totalStats.likes, icon: <Heart size={28} />, color: 'var(--color-danger)' },
              { label: 'Toplam Yorum', value: totalStats.comments, icon: <Users size={28} />, color: 'var(--color-success)' },
            ].map((stat) => (
              <div key={stat.label} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ color: stat.color, marginBottom: '0.75rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* En Çok İndirilen */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Download size={20} color="var(--color-primary)" /> En Çok İndirilen
              </h2>
              {topDocuments.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem 0' }}>Henüz veri yok</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {topDocuments.map((doc, i) => (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-hover)' }}>
                      <span style={{ fontWeight: '800', color: 'var(--color-primary)', minWidth: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>#{i+1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{doc.uploaded_by}</div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: getTypeColor(doc.type), fontWeight: '600', backgroundColor: 'var(--color-surface)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}>
                        {doc.download_count || 0} ↓
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* En Aktif Öğretmenler */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} color="var(--color-success)" /> En Aktif Öğretmenler
              </h2>
              {topUploaders.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem 0' }}>Henüz veri yok</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {topUploaders.map((uploader, i) => {
                    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                    const barWidth = topUploaders[0].count > 0 ? (uploader.count / topUploaders[0].count) * 100 : 0;
                    return (
                      <div key={uploader.name} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-hover)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                          <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{medals[i]}</span> {uploader.name}
                          </span>
                          <span style={{ color: 'var(--color-primary)', fontWeight: '700', fontSize: '0.9rem' }}>{uploader.count} belge</span>
                        </div>
                        <div style={{ background: 'var(--color-border, #e2e8f0)', borderRadius: 'var(--radius-full)', height: '6px' }}>
                          <div style={{ background: 'var(--color-primary)', width: `${barWidth}%`, height: '6px', borderRadius: 'var(--radius-full)', transition: 'width 0.8s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Mobil: tek sütun */}
          <style>{`@media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr !important; } }`}</style>
        </>
      )}
    </div>
  );
};

export default Stats;
