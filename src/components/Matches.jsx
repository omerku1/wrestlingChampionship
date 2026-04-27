import { memo, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, Users } from 'lucide-react';
import { formatScore, getScoreClass } from '../utils/formatScore';
import './Matches.css';

// ---------------------------------------------------------------------------
// Pure result row — CSS transition only, no Framer Motion
// ---------------------------------------------------------------------------
const ResultRow = memo(function ResultRow({ result, gambler, idx, isTopResult }) {
  return (
    <div className="result-row">
      <div className="result-position" aria-hidden="true">
        {isTopResult && result.result > 0 ? '👑' : null}
      </div>
      <div className="result-gambler">
        <span className="result-nickname">
          {gambler ? gambler.nickname : result.id}
        </span>
      </div>
      <div className={`result-score ${getScoreClass(result.result)}`}>
        {formatScore(result.result)}
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Pure match card — entrance animation only, no continuous Framer Motion
// ---------------------------------------------------------------------------
const MatchCard = memo(function MatchCard({ match, index, gamblersArray }) {
  const findGambler = useCallback(
    (id) => gamblersArray.find(g => g.id === id),
    [gamblersArray]
  );

  const sortedResults = useMemo(
    () => [...(match.gamblersResult || [])].sort((a, b) => b.result - a.result),
    [match.gamblersResult]
  );

  return (
    <motion.div
      className="match-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <div className="match-header">
        <h3 className="match-name">{match['match name']}</h3>
        <div className="match-score-badge">
          <Zap size={18} aria-hidden="true" />
          <span>{match['match score']} pts</span>
        </div>
      </div>

      <div className="match-results">
        {sortedResults.map((result, idx) => (
          <ResultRow
            key={result.id}
            result={result}
            gambler={findGambler(result.id)}
            idx={idx}
            isTopResult={idx === 0}
          />
        ))}
      </div>

      <div className="match-footer">
        <Users size={16} aria-hidden="true" />
        <span>{match.gamblersResult.length} Participants</span>
      </div>
    </motion.div>
  );
});

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
function Matches({ eventData }) {
  const gamblersArray = useMemo(() => {
    return Array.isArray(eventData.gamblers)
      ? eventData.gamblers
      : Object.entries(eventData.gamblers).map(([id, gambler]) => ({ id, ...gambler }));
  }, [eventData.gamblers]);

  const displayMatches = useMemo(() => {
    const matches = eventData.matchDetails || eventData.matches || [];
    if (matches[0]?.gamblersResult) {
      return matches;
    }
    return matches.map(match => {
      const matchName = match['match name'];
      const gamblersResult = gamblersArray
        .map(gambler => ({
          id: gambler.id,
          result: gambler.matches?.[matchName] || 0
        }))
        .filter(g => g.result !== 0);
      return { ...match, gamblersResult };
    });
  }, [eventData, gamblersArray]);

  return (
    <div className="matches">
      <motion.div
        className="matches-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Zap size={32} aria-hidden="true" />
        <h2>Match Results</h2>
      </motion.div>

      <div className="matches-grid">
        {displayMatches.map((match, index) => (
          <MatchCard
            key={index}
            match={match}
            index={index}
            gamblersArray={gamblersArray}
          />
        ))}
      </div>
    </div>
  );
}

export default Matches;
