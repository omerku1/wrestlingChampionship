import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Calendar, MapPin, Info, Swords, Clock } from 'lucide-react';
import Header from '../components/Header';
import Leaderboard from '../components/Leaderboard';
import './EventPage.css';

// Automatically import all JSON files from the data directory using Vite's glob import
// This creates a map like: { './Royal_Rumble.json': { default: {...} }, ... }
const eventModules = import.meta.glob('../data/*.json', { eager: true });

// Convert to a simple filename -> data map
const EVENT_DATA_MAP = Object.entries(eventModules).reduce((acc, [path, module]) => {
  const filename = path.split('/').pop(); // Extract just the filename from './data/filename.json'
  acc[filename] = module.default;
  return acc;
}, {});

function EventPage() {
  const { eventFile, eventName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [isNextEvent, setIsNextEvent] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Check if this is an upcoming/next event
    if (eventName) {
      // Determine if it's the next event (with matches) or regular upcoming
      const pathParts = location.pathname.split('/');
      const eventType = pathParts[2]; // 'next' or 'upcoming'

      setIsNextEvent(eventType === 'next');
      setIsUpcoming(true);
      const upcomingEventDetails = location.state?.eventDetails;

      if (upcomingEventDetails) {
        // Create event data structure for upcoming events
        setEventData({
          eventName: upcomingEventDetails.event,
          date: upcomingEventDetails.date,
          location: upcomingEventDetails.location,
          notes: upcomingEventDetails.notes,
          matches: upcomingEventDetails.matches, // Include matches if available
          isUpcoming: true,
          isNextEvent: eventType === 'next'
        });
        setLoading(false);
      } else {
        console.error('No event details provided for upcoming event');
        setLoading(false);
      }
    } else if (eventFile) {
      // Load event data from the static map
      const filename = decodeURIComponent(eventFile);

      const data = EVENT_DATA_MAP[filename];
      if (data) {
        setEventData(data);
        setIsUpcoming(false);
        setIsNextEvent(false);
        setLoading(false);
      } else {
        console.error(`Event file not found: ${filename}`);
        setLoading(false);
      }
    }
  }, [eventFile, eventName, location.state, location.pathname]);

  // Countdown timer effect for next event
  useEffect(() => {
    if (isNextEvent && eventData?.date) {
      const calculateCountdown = () => {
        // Parse the date string (e.g., "February 28")
        const eventDateStr = eventData.date;
        const currentYear = new Date().getFullYear();

        // Try to parse the date
        let eventDate;
        try {
          // Handle dates like "February 28" or "April 18-19" (take first date)
          const datePart = eventDateStr.split('-')[0].trim();
          eventDate = new Date(`${datePart}, ${currentYear}`);

          // If the event date has passed this year, assume it's next year
          if (eventDate < new Date()) {
            eventDate = new Date(`${datePart}, ${currentYear + 1}`);
          }
        } catch (error) {
          console.error('Error parsing date:', error);
          return;
        }

        const now = new Date();
        const difference = eventDate - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          setCountdown({ days, hours, minutes, seconds });
        } else {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      };

      calculateCountdown();
      const timer = setInterval(calculateCountdown, 1000);

      return () => clearInterval(timer);
    }
  }, [isNextEvent, eventData]);

  if (loading) {
    return (
      <div className="page-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Trophy size={64} />
        </motion.div>
        <p>Loading Event Data...</p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="page-error">
        <h1>Failed to load event data</h1>
        <p>Please check if the event file exists</p>
        <button onClick={() => navigate('/')} className="back-button">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="event-page">
      {/* Back Button */}
      <motion.button
        className="back-to-home"
        onClick={() => navigate('/')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft size={20} />
        <span>Back to Season</span>
      </motion.button>

      {isUpcoming ? (
        // Upcoming Event View
        <motion.div
          className="upcoming-event-view"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="upcoming-event-header">
            <motion.div
              className="upcoming-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              style={{ background: isNextEvent ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' : undefined }}
            >
              <Calendar size={20} />
              <span>{isNextEvent ? 'NEXT EVENT' : 'UPCOMING EVENT'}</span>
            </motion.div>

            <motion.h1
              className="upcoming-event-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {eventData.eventName}
            </motion.h1>

            {/* Date and Location under title */}
            <motion.div
              className="event-meta"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="event-meta-item">
                <Calendar size={18} />
                <span>{eventData.date}</span>
              </div>
              <div className="event-meta-separator">•</div>
              <div className="event-meta-item">
                <MapPin size={18} />
                <span>{eventData.location}</span>
              </div>
            </motion.div>

            {/* Countdown Timer for Next Event */}
            {isNextEvent && (
              <motion.div
                className="countdown-timer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="countdown-label">
                  <Clock size={20} />
                  <span>EVENT STARTS IN</span>
                </div>
                <div className="countdown-display">
                  <div className="countdown-unit">
                    <div className="countdown-value">{String(countdown.days).padStart(2, '0')}</div>
                    <div className="countdown-unit-label">Days</div>
                  </div>
                  <div className="countdown-separator">:</div>
                  <div className="countdown-unit">
                    <div className="countdown-value">{String(countdown.hours).padStart(2, '0')}</div>
                    <div className="countdown-unit-label">Hours</div>
                  </div>
                  <div className="countdown-separator">:</div>
                  <div className="countdown-unit">
                    <div className="countdown-value">{String(countdown.minutes).padStart(2, '0')}</div>
                    <div className="countdown-unit-label">Minutes</div>
                  </div>
                  <div className="countdown-separator">:</div>
                  <div className="countdown-unit">
                    <div className="countdown-value">{String(countdown.seconds).padStart(2, '0')}</div>
                    <div className="countdown-unit-label">Seconds</div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="upcoming-event-details">
              {eventData.notes && (
                <motion.div
                  className="detail-card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Info size={24} />
                  <div>
                    <div className="detail-label">Notes</div>
                    <div className="detail-value">{eventData.notes}</div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Matches Section for Next Event */}
            {isNextEvent && eventData.matches && eventData.matches.length > 0 && (
              <motion.div
                className="matches-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h2 className="matches-title">
                  <Swords size={28} />
                  Card
                </h2>
                <div className="matches-list">
                  {eventData.matches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      className="match-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                    >
                      <div className="match-number">Match {match.id}</div>
                      <div className="match-competitors">{match.match}</div>
                      <div className="match-type">{match.type}</div>
                      {match.stipulation && (
                        <div className="match-stipulation">{match.stipulation}</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              className="coming-soon-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: isNextEvent && eventData.matches ? 1.2 : 0.8 }}
            >
              <Trophy size={32} />
              <p>Betting results will be available after the event concludes</p>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        // Past Event View
        <>
          <Header eventData={eventData} />

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Leaderboard eventData={eventData} />
          </motion.div>
        </>
      )}
    </div>
  );
}

export default EventPage;

