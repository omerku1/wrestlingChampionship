import { memo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import EventStats from './EventStats';
import './Header.css';

const Header = memo(function Header({ eventData }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.header
      className="event-header"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="header-glow" aria-hidden="true" />

      <div className="header-content">
        <h1 className="event-title">{eventData.eventName}</h1>

        <div className="event-details">
          <div className="detail-item">
            <Calendar size={20} aria-hidden="true" />
            <span>{formatDate(eventData.eventDate)}</span>
          </div>
          <div className="detail-divider" aria-hidden="true" />
          <div className="detail-item">
            <MapPin size={20} aria-hidden="true" />
            <span>{eventData.location}</span>
          </div>
        </div>

        <EventStats eventData={eventData} />
      </div>

      <div className="header-decoration" aria-hidden="true">
        <div className="decoration-line" />
      </div>
    </motion.header>
  );
});

export default Header;
