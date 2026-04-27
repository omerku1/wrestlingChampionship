import { memo, useMemo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatScore, getScoreClass } from '../utils/formatScore';
import './GlobalLeaderboard.css';
import logo from '../logo.png';
import belt from '../belt.png';
import eventsSchedule from '../data/Events_Schedule.json';

// ---------------------------------------------------------------------------
// How many rows to show before the "Show All" button appears.
// The full list has 40+ entries; rendering all on mount is wasteful.
// ---------------------------------------------------------------------------
const INITIAL_ROW_LIMIT = 15;

// ---------------------------------------------------------------------------
// Pure row component — memoised so it only re-renders when its data changes.
// ---------------------------------------------------------------------------
const LeaderboardRow = memo(function LeaderboardRow({ gambler, pastEvents, nextEvent, upcomingEvents }) {
  const { rank } = gambler;

  const rankIcon =
    rank === 1 ? '🥇' :
    rank === 2 ? '🥈' :
    rank === 3 ? '🥉' : null;

  const rankClass =
    rank === 1 ? 'rank-1' :
    rank === 2 ? 'rank-2' :
    rank === 3 ? 'rank-3' : '';

  return (
    <tr className={`table-row ${rankClass}`}>
      <td className="col-rank">
        <div className="rank-cell">
          {rankIcon
            ? <span className="rank-medal">{rankIcon}</span>
            : <span className="rank-number">#{rank}</span>
          }
        </div>
      </td>
      <td className="col-nickname">
        <div className="nickname-cell">
          <span className="nickname-text">{gambler.nickname}</span>
        </div>
      </td>
      <td className="col-score">
        <span className={`score-value ${getScoreClass(gambler.totalPoints)}`}>
          {formatScore(gambler.totalPoints)}
        </span>
      </td>
      {gambler.history.map((event, idx) => (
        <td key={`past-${idx}`} className="col-event">
          <span className={`event-points ${getScoreClass(event.points)}`}>
            {formatScore(event.points)}
          </span>
        </td>
      ))}
      {nextEvent && (
        <td className="col-event next-event-col">
          <span className="event-points next-event-empty">-</span>
        </td>
      )}
      {upcomingEvents.map((_, idx) => (
        <td key={`upcoming-${idx}`} className="col-event upcoming-event-col">
          <span className="event-points upcoming-empty">-</span>
        </td>
      ))}
    </tr>
  );
});

// ---------------------------------------------------------------------------
// Mobile card — shows rank, nickname, total score, and last 3 event scores.
// ---------------------------------------------------------------------------
const MobileLeaderboardCard = memo(function MobileLeaderboardCard({ gambler }) {
  const { rank } = gambler;

  const rankIcon =
    rank === 1 ? '🥇' :
    rank === 2 ? '🥈' :
    rank === 3 ? '🥉' : null;

  const rankClass =
    rank === 1 ? 'rank-1' :
    rank === 2 ? 'rank-2' :
    rank === 3 ? 'rank-3' : '';

  const lastThree = gambler.history.slice(-3);

  return (
    <div className={`mobile-lb-card ${rankClass}`}>
      <div className="mobile-lb-card-top">
        <div className="mobile-lb-rank">
          {rankIcon
            ? <span className="rank-medal">{rankIcon}</span>
            : <span className="rank-number">#{rank}</span>
          }
        </div>
        <div className="mobile-lb-identity">
          <span className="nickname-text">{gambler.nickname}</span>
        </div>
        <div className="mobile-lb-total">
          <span className={`score-value ${getScoreClass(gambler.totalPoints)}`}>
            {formatScore(gambler.totalPoints)}
          </span>
        </div>
      </div>
      {lastThree.length > 0 && (
        <div className="mobile-lb-history">
          {lastThree.map((ev, idx) => (
            <div key={idx} className="mobile-lb-history-item">
              <span className="mobile-lb-event-name">{ev.event}</span>
              <span className={`event-points ${getScoreClass(ev.points)}`}>
                {formatScore(ev.points)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// ---------------------------------------------------------------------------
// Desktop table
// ---------------------------------------------------------------------------
const LeaderboardTable = memo(function LeaderboardTable({ leaderboard, pastEvents, nextEvent, upcomingEvents }) {
  const [showAll, setShowAll] = useState(false);

  const visibleRows = showAll ? leaderboard : leaderboard.slice(0, INITIAL_ROW_LIMIT);

  return (
    <>
      <div className="leaderboard-table-container">
        <table className="standings-table">
          <caption className="visually-hidden">Season standings — all gamblers ranked by total score</caption>
          <thead>
            <tr>
              <th className="col-rank" scope="col">Standing</th>
              <th className="col-nickname" scope="col">Nickname</th>
              <th className="col-score" scope="col">Total Score</th>
              {pastEvents.map((event, idx) => (
                <th key={`past-${idx}`} className="col-event" scope="col">{event.event}</th>
              ))}
              {nextEvent && (
                <th className="col-event next-event-col" scope="col">{nextEvent.event}</th>
              )}
              {upcomingEvents.map((event, idx) => (
                <th key={`upcoming-${idx}`} className="col-event upcoming-event-col" scope="col">{event.event}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((gambler) => (
              <LeaderboardRow
                key={gambler.id}
                gambler={gambler}
                pastEvents={pastEvents}
                nextEvent={nextEvent}
                upcomingEvents={upcomingEvents}
              />
            ))}
          </tbody>
        </table>
      </div>

      {!showAll && leaderboard.length > INITIAL_ROW_LIMIT && (
        <button
          className="show-all-btn"
          onClick={() => setShowAll(true)}
          aria-label={`Show all ${leaderboard.length} gamblers`}
        >
          Show all {leaderboard.length} gamblers
        </button>
      )}
    </>
  );
});

// ---------------------------------------------------------------------------
// Mobile card list — same virtualisation approach
// ---------------------------------------------------------------------------
const MobileLeaderboardList = memo(function MobileLeaderboardList({ leaderboard }) {
  const [showAll, setShowAll] = useState(false);
  const visibleCards = showAll ? leaderboard : leaderboard.slice(0, INITIAL_ROW_LIMIT);

  return (
    <>
      <div className="mobile-lb-list">
        {visibleCards.map((gambler) => (
          <MobileLeaderboardCard key={gambler.id} gambler={gambler} />
        ))}
      </div>
      {!showAll && leaderboard.length > INITIAL_ROW_LIMIT && (
        <button
          className="show-all-btn"
          onClick={() => setShowAll(true)}
          aria-label={`Show all ${leaderboard.length} gamblers`}
        >
          Show all {leaderboard.length} gamblers
        </button>
      )}
    </>
  );
});

// ---------------------------------------------------------------------------
// Sidebar event item — CSS hover instead of Framer Motion whileHover
// ---------------------------------------------------------------------------
const EventListItem = memo(function EventListItem({ event, className, onClick }) {
  return (
    <div
      className={`event-list-item ${className ?? ''}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Navigate to ${event.event}`}
    >
      <div className="event-list-content">
        <div className="event-list-name">
          {event.event}
          {event.date && <div className="event-date">{event.date}</div>}
        </div>
        <ChevronRight size={18} aria-hidden="true" />
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
function GlobalLeaderboard({ seasonData }) {
  const navigate = useNavigate();

  // Memoised sort + rank calculation — only recalculates when seasonData changes
  const leaderboardWithRanks = useMemo(() => {
    const sorted = [...seasonData.globalLeaderboard].sort((a, b) => b.totalPoints - a.totalPoints);
    let currentRank = 1;
    return sorted.map((gambler, index) => {
      if (index > 0 && gambler.totalPoints < sorted[index - 1].totalPoints) {
        currentRank = index + 1;
      }
      return { ...gambler, rank: currentRank };
    });
  }, [seasonData]);

  const handlePastEventClick = useCallback((event) => {
    const filename = event.event.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    navigate(`/event/${encodeURIComponent(filename)}`);
  }, [navigate]);

  const handleNextEventClick = useCallback(() => {
    navigate(`/event/next/${encodeURIComponent(eventsSchedule['next event'].event)}`, {
      state: { eventDetails: eventsSchedule['next event'] }
    });
  }, [navigate]);

  const handleUpcomingEventClick = useCallback((event) => {
    navigate(`/event/upcoming/${encodeURIComponent(event.event)}`, {
      state: { eventDetails: event }
    });
  }, [navigate]);

  const pastEvents = eventsSchedule['past events'] || [];
  const nextEvent = eventsSchedule['next event'];
  const upcomingEvents = eventsSchedule['upcoming events'] || [];

  return (
    <div className="global-leaderboard">
      {/* Season Header — entrance animation only, no repeat */}
      <motion.div
        className="season-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="season-glow" aria-hidden="true" />

        <motion.div
          className="season-title-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
        >
          <img
            src={logo}
            alt="Wrestling Championship Logo"
            className="season-logo"
            width={120}
            height={120}
            style={{ width: '120px', height: '120px', objectFit: 'contain' }}
          />
          <h1 className="season-title">{seasonData.seasonName}</h1>
        </motion.div>
      </motion.div>

      {/* Main Content Layout */}
      <div className="main-content-layout">
        {/* Events Sidebar — entrance animation only */}
        <motion.aside
          className="events-sidebar"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2>
            <Calendar size={24} aria-hidden="true" />
            Past Events
          </h2>
          <div className="events-list">
            {pastEvents.map((event) => (
              <EventListItem
                key={event.event}
                event={event}
                onClick={() => handlePastEventClick(event)}
              />
            ))}
          </div>

          {nextEvent && (
            <>
              <h2 style={{ marginTop: '2rem' }}>
                <Calendar size={24} aria-hidden="true" />
                Next Event
              </h2>
              <div className="events-list">
                <EventListItem
                  event={nextEvent}
                  className="next-event"
                  onClick={handleNextEventClick}
                />
              </div>
            </>
          )}

          {upcomingEvents.length > 0 && (
            <>
              <h2 style={{ marginTop: '2rem' }}>
                <Calendar size={24} aria-hidden="true" />
                Upcoming Events
              </h2>
              <div className="events-list">
                {upcomingEvents.map((event) => (
                  <EventListItem
                    key={event.event}
                    event={event}
                    className="upcoming-event"
                    onClick={() => handleUpcomingEventClick(event)}
                  />
                ))}
              </div>
            </>
          )}
        </motion.aside>

        {/* Leaderboard Section — entrance animation only */}
        <motion.div
          className="leaderboard-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {/* Current Champion Card */}
          <motion.div
            className="current-champion-card"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="champion-content">
              <div className="champion-label">
                <span>Current Champion</span>
              </div>
              <div className="champion-name">{seasonData.currentChampion}</div>
              <img
                src={belt}
                alt="Championship Belt"
                className="champion-belt"
                width={180}
              />
            </div>
          </motion.div>

          <h2>Season Standings</h2>

          {/* Desktop table — hidden on mobile via CSS */}
          <div className="desktop-leaderboard">
            <LeaderboardTable
              leaderboard={leaderboardWithRanks}
              pastEvents={pastEvents}
              nextEvent={nextEvent}
              upcomingEvents={upcomingEvents}
            />
          </div>

          {/* Mobile card list — hidden on desktop via CSS */}
          <div className="mobile-leaderboard">
            <MobileLeaderboardList leaderboard={leaderboardWithRanks} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default GlobalLeaderboard;
