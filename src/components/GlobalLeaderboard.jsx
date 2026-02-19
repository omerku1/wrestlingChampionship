import { motion } from 'framer-motion';
import { Trophy, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './GlobalLeaderboard.css';
import logo from '../logo.png';

function LeaderboardTable({ leaderboard, pastEvents, nextEvent, upcomingEvents }) {
  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankClass = (rank) => {
    if (rank <= 3) return `rank-${rank}`;
    return '';
  };

  const getScoreClass = (score) => {
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className="leaderboard-table-container">
      <table className="standings-table">
        <thead>
          <tr>
            <th className="col-rank">Standing</th>
            <th className="col-nickname">Nickname</th>
            <th className="col-score">Total Score</th>
            {pastEvents.map((event, idx) => (
              <th key={`past-${idx}`} className="col-event">{event.event}</th>
            ))}
            {nextEvent && (
              <th className="col-event next-event-col">
                {nextEvent.event}
              </th>
            )}
            {upcomingEvents.map((event, idx) => (
              <th key={`upcoming-${idx}`} className="col-event upcoming-event-col">
                {event.event}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((gambler, index) => {
            const rank = gambler.rank;
            const rankIcon = getRankIcon(rank);

            return (
              <motion.tr
                key={gambler.id}
                className={`table-row ${getRankClass(rank)}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ backgroundColor: 'rgba(233, 69, 96, 0.1)' }}
              >
                <td className="col-rank">
                  <div className="rank-cell">
                    {rankIcon ? (
                      <span className="rank-medal">{rankIcon}</span>
                    ) : (
                      <span className="rank-number">#{rank}</span>
                    )}
                  </div>
                </td>
                <td className="col-nickname">
                  <div className="nickname-cell">
                    <span className="nickname-text">{gambler.nickname}</span>
                  </div>
                </td>

                {/* Total Score immediately after Nickname */}
                <td className="col-score">
                  <span className={`score-value ${getScoreClass(gambler.totalPoints)}`}>
                    {gambler.totalPoints > 0 && '+'}
                    {gambler.totalPoints}
                  </span>
                </td>

                {gambler.history.map((event, idx) => (
                  <td key={`past-${idx}`} className="col-event">
                    <span className={`event-points ${getScoreClass(event.points)}`}>
                      {event.points > 0 && '+'}
                      {event.points}
                    </span>
                  </td>
                ))}
                {nextEvent && (
                  <td className="col-event next-event-col">
                    <span className="event-points next-event-empty">-</span>
                  </td>
                )}
                {upcomingEvents.map((event, idx) => (
                  <td key={`upcoming-${idx}`} className="col-event upcoming-event-col">
                    <span className="event-points upcoming-empty">-</span>
                  </td>
                ))}
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GlobalLeaderboard({ seasonData }) {
  const navigate = useNavigate();

  // Sort leaderboard by totalPoints (descending) and calculate ranks
  const sortedLeaderboard = [...seasonData.globalLeaderboard].sort((a, b) => b.totalPoints - a.totalPoints);

  // Calculate ranks (handle ties)
  let currentRank = 1;
  const leaderboardWithRanks = sortedLeaderboard.map((gambler, index) => {
    if (index > 0 && gambler.totalPoints < sortedLeaderboard[index - 1].totalPoints) {
      currentRank = index + 1;
    }
    return { ...gambler, rank: currentRank };
  });


  return (
    <div className="global-leaderboard">
      {/* Season Header */}
      <motion.div
        className="season-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="season-glow"></div>

        <motion.div
          className="season-title-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
        >
          <img
            src={logo}
            alt="WWE Logo"
            className="season-logo"
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'contain'
            }}
          />
          <h1 className="season-title">
            {seasonData.seasonName}
          </h1>
        </motion.div>
      </motion.div>

      {/* Main Content Layout - Events + Leaderboard */}
      <div className="main-content-layout">
        {/* Events Sidebar */}
        <motion.aside
          className="events-sidebar"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2>
            <Calendar size={24} />
            Past Events
          </h2>
          <div className="events-list">
            {seasonData.globalLeaderboard[0]?.history.map((event, index) => (
              <motion.div
                key={event.event}
                className="event-list-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ x: 5 }}
                onClick={() => {
                  // Convert event name to filename format
                  const filename = event.event.replace(/\s+/g, '_') + '.json';
                  navigate(`/event/${encodeURIComponent(filename)}`);
                }}
              >
                <div className="event-list-content">
                  <div className="event-list-name">{event.event}</div>
                  <ChevronRight size={18} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Next Event Section */}
          {seasonData["Next Event"] && (
            <>
              <h2 style={{ marginTop: '2rem' }}>
                <Calendar size={24} />
                Next Event
              </h2>
              <div className="events-list">
                <motion.div
                  className="event-list-item next-event"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ x: 5 }}
                  onClick={() => {
                    // Navigate to next event with special handling
                    navigate(`/event/next/${encodeURIComponent(seasonData["Next Event"].event)}`, {
                      state: { eventDetails: seasonData["Next Event"] }
                    });
                  }}
                >
                  <div className="event-list-content">
                    <div className="event-list-name">
                      {seasonData["Next Event"].event}
                      <div className="event-date">{seasonData["Next Event"].date}</div>
                    </div>
                    <ChevronRight size={18} />
                  </div>
                </motion.div>
              </div>
            </>
          )}

          {/* Upcoming Events Section */}
          {seasonData["upcoming events"] && seasonData["upcoming events"].length > 0 && (
            <>
              <h2 style={{ marginTop: '2rem' }}>
                <Calendar size={24} />
                Upcoming Events
              </h2>
              <div className="events-list">
                {seasonData["upcoming events"].map((event, index) => (
                  <motion.div
                    key={event.event}
                    className="event-list-item upcoming-event"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                    onClick={() => {
                      // Navigate to upcoming event with special handling
                      navigate(`/event/upcoming/${encodeURIComponent(event.event)}`, {
                        state: { eventDetails: event }
                      });
                    }}
                  >
                    <div className="event-list-content">
                      <div className="event-list-name">
                        {event.event}
                        <div className="event-date">{event.date}</div>
                      </div>
                      <ChevronRight size={18} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.aside>

        {/* Leaderboard Section */}
        <motion.div
          className="leaderboard-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2>
            <Trophy size={24} />
            Season Standings
          </h2>

          <LeaderboardTable
            leaderboard={leaderboardWithRanks}
            pastEvents={seasonData.globalLeaderboard[0]?.history || []}
            nextEvent={seasonData["Next Event"]}
            upcomingEvents={seasonData["upcoming events"] || []}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default GlobalLeaderboard;

