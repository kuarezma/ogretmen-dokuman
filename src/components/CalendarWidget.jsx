import React from 'react';
import { Calendar as CalendarIcon, Clock, Bell, AlertCircle } from 'lucide-react';
import './CalendarWidget.css';

const EVENTS = [
  { id: 1, title: '1. Dönem 1. Sınavlar', date: 'Bitiş: 10 Kasım', type: 'exam', status: 'past' },
  { id: 2, title: '1. Dönem Ara Tatil', date: '11-15 Kasım', type: 'holiday', status: 'past' },
  { id: 3, title: '1. Dönem 2. Sınavlar', date: 'Aralık Sonu - Ocak Başı', type: 'exam', status: 'past' },
  { id: 4, title: 'Yarıyıl Tatili (15 Tatil)', date: '20 Ocak - 2 Şubat', type: 'holiday', status: 'past' },
  { id: 5, title: '2. Dönem 1. Sınavlar', date: 'Mart Sonu', type: 'exam', status: 'active' },
  { id: 6, title: '2. Dönem Ara Tatil', date: '31 Mart - 4 Nisan', type: 'holiday', status: 'upcoming' },
  { id: 7, title: '2. Dönem 2. Sınavlar', date: 'Mayıs Sonu - Haziran Başı', type: 'exam', status: 'upcoming' },
  { id: 8, title: 'Yaz Tatili Başlangıcı', date: '20 Haziran', type: 'holiday', status: 'upcoming' }
];

const CalendarWidget = () => {
  // Show only active or upcoming events, max 4
  const visibleEvents = EVENTS.filter(e => e.status !== 'past').slice(0, 4);

  const getEventIcon = (type) => {
    switch (type) {
      case 'exam': return <Clock size={16} />;
      case 'holiday': return <Bell size={16} />;
      default: return <CalendarIcon size={16} />;
    }
  };

  return (
    <div className="calendar-widget glass-panel">
      <div className="calendar-header">
        <h3><CalendarIcon size={20} /> MEB Akademik Takvim</h3>
        <span className="calendar-subtitle">Yaklaşan Önemli Tarihler</span>
      </div>
      
      <div className="calendar-list">
        {visibleEvents.map((event) => (
          <div key={event.id} className={`calendar-item ${event.status}`}>
            <div className="calendar-item-icon">
              {getEventIcon(event.type)}
            </div>
            <div className="calendar-item-details">
              <h4>{event.title}</h4>
              <p>{event.date}</p>
            </div>
            {event.status === 'active' && (
              <span className="active-badge" title="Şu anki veya en yakın etkinlik">
                <AlertCircle size={16} /> Yaklaşıyor
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="calendar-footer">
        Planlarınızı bu tarihlere göre ayarlayın. Sitedeki materyaller takvime uygun önerilir.
      </div>
    </div>
  );
};

export default CalendarWidget;
