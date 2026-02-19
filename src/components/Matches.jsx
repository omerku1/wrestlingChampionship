import { motion } from 'framer-motion';
import { Zap, Users } from 'lucide-react';
import './Matches.css';

function Matches({ eventData }) {
  const getScoreClass = (score) => {
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  };

  // Check if gamblers is an object (new format) or array (old format)
  const gamblersArray = Array.isArray(eventData.gamblers)
    ? eventData.gamblers
    : Object.entries(eventData.gamblers).map(([id, gambler]) => ({
        id,
        ...gambler
      }));

  const findGambler = (id) => {
    return gamblersArray.find(g => g.id === id);
  };

  const matches = eventData.matchDetails || eventData.matches || [];

  // For new format, we need to construct match results from the gamblers data
  const getMatchesForDisplay = () => {
    if (matches[0]?.gamblersResult) {
      // Old format - already has gamblersResult
      return matches;
    } else {
      // New format - construct from gamblers.matches
      return matches.map(match => {
        const matchName = match['match name'];
        const gamblersResult = gamblersArray
          .map(gambler => ({
            id: gambler.id,
            result: gambler.matches?.[matchName] || 0
          }))
          .filter(g => g.result !== 0); // Only include gamblers with results
        return {
          ...match,
          gamblersResult
        };
      });
    }
  };

  const displayMatches = getMatchesForDisplay();

  return (
    <div className="matches">
      <motion.div
        className="matches-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Zap size={32} />
        <h2>Match Results</h2>
      </motion.div>

      <div className="matches-grid">
        {displayMatches.map((match, index) => {
          const sortedResults = [...(match.gamblersResult || [])].sort((a, b) => b.result - a.result);

          return (
            <motion.div
              key={index}
              className="match-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="match-header">
                <h3 className="match-name">{match['match name']}</h3>
                <div className="match-score-badge">
                  <Zap size={18} />
                  <span>{match['match score']} pts</span>
                </div>
              </div>

              <div className="match-results">
                {sortedResults.map((result, idx) => {
                  const gambler = findGambler(result.id);
                  return (
                    <motion.div
                      key={result.id}
                      className="result-row"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index * 0.1) + (idx * 0.03) }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="result-position">
                        {idx === 0 && result.result > 0 && '👑'}
                      </div>
                      <div className="result-gambler">
                        <span className="result-nickname">
                          {gambler ? gambler.nickname : result.id}
                        </span>
                      </div>
                      <div className={`result-score ${getScoreClass(result.result)}`}>
                        {result.result > 0 && '+'}
                        {result.result}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="match-footer">
                <Users size={16} />
                <span>{match.gamblersResult.length} Participants</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default Matches;

