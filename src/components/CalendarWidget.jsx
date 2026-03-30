import React, { useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Bell, AlertCircle, Award, Star } from 'lucide-react';
import './CalendarWidget.css';

const EVENTS = [
  { id: 1, title: '2. Dönem Ara Tatil', date: '16 - 20 Mart', startDate: '2026-03-16', endDate: '2026-03-20', type: 'holiday' },
  { id: 2, title: '23 Nisan Ulusal Egemenlik', date: '23 Nisan', startDate: '2026-04-23', endDate: '2026-04-23', type: 'holiday' },
  { id: 3, title: '1 Mayıs Emek ve Dayanışma', date: '1 Mayıs', startDate: '2026-05-01', endDate: '2026-05-01', type: 'holiday' },
  { id: 4, title: '19 Mayıs Gençlik ve Spor', date: '19 Mayıs', startDate: '2026-05-19', endDate: '2026-05-19', type: 'holiday' },
  { id: 5, title: 'Kurban Bayramı', date: '27 - 30 Mayıs', startDate: '2026-05-27', endDate: '2026-05-30', type: 'holiday' },
  { id: 6, title: 'LGS Sınavı', date: '14 Haziran', startDate: '2026-06-14', endDate: '2026-06-14', type: 'exam' },
  { id: 7, title: 'YKS (TYT, AYT, YDT)', date: '20 - 21 Haziran', startDate: '2026-06-20', endDate: '2026-06-21', type: 'exam' },
  { id: 8, title: 'Yaz Tatili Başlangıcı', date: '26 Haziran', startDate: '2026-06-26', endDate: '2026-06-26', type: 'holiday' },
  { id: 9, title: 'Seminer Dönemi Başlangıcı', date: '29 Haziran', startDate: '2026-06-29', endDate: '2026-06-29', type: 'work' }
];

const CalendarWidget = () => {
  const processedEvents = useMemo(() => {
    const today = new Date();
    return EVENTS.map(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      end.setHours(23, 59, 59); // End of day

      let status = 'upcoming';
      if (today > end) {
        status = 'past';
      } else if (today >= start && today <= end) {
        status = 'active';
      } else {
        // If event is in the next 7 days, mark as active/near
        const diffTime = Math.abs(start - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          status = 'soon';
        }
      }

      return { ...event, status };
    });
  }, []);

  const visibleEvents = processedEvents
    .filter(e => e.status !== 'past')
    .slice(0, 4);

  const getEventIcon = (type, status) => {
    if (status === 'active') return <Star className="animate-pulse" size={16} />;
    
    switch (type) {
      case 'exam': return <Award size={16} />;
      case 'holiday': return <Bell size={16} />;
      case 'work': return <Clock size={16} />;
      default: return <CalendarIcon size={16} />;
    }
  };

  return (
    <div className="calendar-widget glass-panel">
      <div className="calendar-header">
        <div className="header-top">
          <h3><CalendarIcon size={20} /> MEB Akademik Takvim</h3>
          <div className="live-indicator">
            <span className="dot"></span>
            Canlı Bilgi
          </div>
        </div>
        <span className="calendar-subtitle">Yaklaşan Önemli Tarihler & Sınavlar</span>
      </div>
      
      <div className="calendar-list">
        {visibleEvents.length > 0 ? (
          visibleEvents.map((event) => (
            <div key={event.id} className={`calendar-item ${event.status}`}>
              <div className="calendar-item-icon">
                {getEventIcon(event.type, event.status)}
              </div>
              <div className="calendar-item-details">
                <h4>{event.title}</h4>
                <p>{event.date}</p>
              </div>
              {event.status === 'active' && (
                <span className="active-badge" title="Şu an devam ediyor">
                  <AlertCircle size={14} /> Devam Ediyor
                </span>
              )}
              {event.status === 'soon' && (
                <span className="soon-badge">Yaklaşıyor</span>
              )}
            </div>
          ))
        ) : (
          <div className="no-events">
            Yakın zamanda planlanmış bir etkinlik bulunmuyor.
          </div>
        )}
      </div>
      
      <div className="calendar-footer">
        <p>Planlarınızı bu tarihlere göre ayarlayın.</p>
        <div className="footer-links">
          <span>Resmi Takvim 2025-2026</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
