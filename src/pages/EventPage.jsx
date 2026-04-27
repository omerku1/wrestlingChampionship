import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Calendar, MapPin, Info, Swords, Clock } from 'lucide-react';
import Header from '../components/Header';
import Leaderboard from '../components/Leaderboard';
import './EventPage.css';

// Automatically import all JSON files from the data directory using Vite's glob import
const eventModules = import.meta.glob('../data/*.json', { eager: true });

const EVENT_DATA_MAP = Object.entries(eventModules).reduce((acc, [path, module]) => {
  const filename = path.split('/').pop().replace('.json', '').replace(/_/g, '-').toLowerCase();
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
    if (eventName) {
      const pathParts = location.pathname.split('/');
      const eventType = pathParts[2]; // 'next' or 'upcoming'

      setIsNextEvent(eventType === 'next');
      setIsUpcoming(true);
      const upcomingEventDetails = location.state?.eventDetails;

      if (upcomingEventDetails) {
        setEventData({
          eventName: upcomingEventDetails.event,
          date: upcomingEventDetails.date,
          location: upcomingEventDetails.location,
          notes: upcomingEventDetails.notes,
          matches: upcomingEventDetails.matches,
          'Start time': upcomingEventDetails['Start time'],
          isUpcoming: true,
          isNextEvent: eventType === 'next'
        });
        setLoading(false);
      } else {
        console.error('No event details provided for upcoming event');
        setLoading(false);
      }
    } else if (eventFile) {
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

  // Countdown timer — interval is cleared on unmount via the returned cleanup function
  useEffect(() => {
    if (!isNextEvent || !eventData?.['Start time']) return;

    const calculateCountdown = () => {
      let eventDate;
      try {
        eventDate = new Date(eventData['Start time']);
      } catch (error) {
        console.error('Error parsing start time:', error);
        return;
      }

      const difference = eventDate - Date.now();

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);

    // Cleanup — prevents memory leak on unmount or when dependencies change
    return () => clearInterval(timer);
  }, [isNextEvent, eventData]);

  if (loading) {
    return (
      <div className="page-loading" role="status" aria-label="Loading event data">
        <div className="loading-spinner" aria-hidden="true" />
        <p>Loading Event Data...</p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="page-error" role="alert">
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
      <button
        className="back-to-home"
        onClick={() => navigate('/')}
        aria-label="Back to season overview"
      >
        <ArrowLeft size={20} aria-hidden="true" />
        <span>Back to Season</span>
      </button>

      {isUpcoming ? (
        // Upcoming Event View
        <motion.div
          className="upcoming-event-view"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="upcoming-event-header">
            <div
              className="upcoming-badge"
              style={isNextEvent ? { background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' } : undefined}
            >
              <Calendar size={20} aria-hidden="true" />
              <span>{isNextEvent ? 'NEXT EVENT' : 'UPCOMING EVENT'}</span>
            </div>

            <h1 className="upcoming-event-title">{eventData.eventName}</h1>

            {/* Date and Location */}
            <div className="event-meta">
              <div className="event-meta-item">
                <Calendar size={18} aria-hidden="true" />
                <span>{eventData.date}</span>
              </div>
              <div className="event-meta-separator" aria-hidden="true">•</div>
              <div className="event-meta-item">
                <MapPin size={18} aria-hidden="true" />
                <span>{eventData.location}</span>
              </div>
            </div>

            {/* Countdown Timer for Next Event */}
            {isNextEvent && (
              <div className="countdown-timer" role="timer" aria-label="Time until event starts">
                <div className="countdown-label">
                  <Clock size={20} aria-hidden="true" />
                  <span>EVENT STARTS IN</span>
                </div>
                <div className="countdown-display">
                  <div className="countdown-unit">
                    <div className="countdown-value">{String(countdown.days).padStart(2, '0')}</div>
                    <div className="countdown-unit-label">Days</div>
                  </div>
                  <div className="countdown-separator" aria-hidden="true">:</div>
                  <div className="countdown-unit">
                    <div className="countdown-value">{String(countdown.hours).padStart(2, '0')}</div>
                    <div className="countdown-unit-label">Hours</div>
                  </div>
                  <div className="countdown-separator" aria-hidden="true">:</div>
                  <div className="countdown-unit">
                    <div className="countdown-value">{String(countdown.minutes).padStart(2, '0')}</div>
                    <div className="countdown-unit-label">Minutes</div>
                  </div>
                  <div className="countdown-separator" aria-hidden="true">:</div>
                  <div className="countdown-unit">
                    <div className="countdown-value">{String(countdown.seconds).padStart(2, '0')}</div>
                    <div className="countdown-unit-label">Seconds</div>
                  </div>
                </div>
              </div>
            )}

            <div className="upcoming-event-details">
              {eventData.notes && (
                <div className="detail-card">
                  <Info size={24} aria-hidden="true" />
                  <div>
                    <div className="detail-label">Notes</div>
                    <div className="detail-value">{eventData.notes}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Matches Section for Next Event */}
            {isNextEvent && eventData.matches && eventData.matches.length > 0 && (
              <div className="matches-section">
                <h2 className="matches-title">
                  <Swords size={28} aria-hidden="true" />
                  Card
                </h2>
                <div className="matches-list">
                  {eventData.matches.map((match, index) => (
                    <div key={match.id} className="match-card">
                      <div className="match-number">Match {match.id}</div>
                      <div className="match-competitors">{match.match}</div>
                      <div className="match-type">{match.type}</div>
                      {match.stipulation && (
                        <div className="match-stipulation">{match.stipulation}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="coming-soon-message">
              <Trophy size={32} aria-hidden="true" />
              <p>Betting results will be available after the event concludes</p>
            </div>
          </div>
        </motion.div>
      ) : (
        // Past Event View
        <>
          <Header eventData={eventData} />

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
