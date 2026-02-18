import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import EventStats from './EventStats';
import './Header.css';

function Header({ eventData }) {
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
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="header-glow"></div>

      <motion.div
        className="header-content"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >

        <motion.h1
          className="event-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {eventData.eventName}
        </motion.h1>

        <motion.div
          className="event-details"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="detail-item">
            <Calendar size={20} />
            <span>{formatDate(eventData.eventDate)}</span>
          </div>
          <div className="detail-divider"></div>
          <div className="detail-item">
            <MapPin size={20} />
            <span>{eventData.location}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <EventStats eventData={eventData} />
        </motion.div>
      </motion.div>

      <div className="header-decoration">
        <motion.div
          className="decoration-line"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        />
      </div>
    </motion.header>
  );
}

export default Header;

