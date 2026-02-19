import { motion } from 'framer-motion';
import { useMemo } from 'react';
import './Leaderboard.css';

function Leaderboard({ eventData }) {
  const leaderboardData = useMemo(() => {
    const scores = {};

    // Initialize scores for each gambler
    eventData.gamblers.forEach(gambler => {
      scores[gambler.id] = {
        nickname: gambler.nickname,
        totalScore: 0,
        matchScores: []
      };
    });

    // Calculate total scores and collect match scores
    eventData.matches.forEach(match => {
      match.gamblersResult.forEach(result => {
        if (scores[result.id]) {
          scores[result.id].totalScore += result.result;
          scores[result.id].matchScores.push(result.result);
        }
      });
    });

    // Convert to array and sort by total score
    return Object.entries(scores)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [eventData]);

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getScoreClass = (score) => {
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className="leaderboard">
      <div className="leaderboard-table-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th className="col-rank">Rank</th>
              <th className="col-nickname">Nickname</th>
              <th className="col-total">Total</th>
              {eventData.matches.map((match, idx) => (
                <th key={idx} className="col-match">
                  {match['match name']}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((gambler, index) => {
              const rank = index + 1;
              const rankIcon = getRankIcon(rank);
              const shouldAnimate = index < 10; // Only animate top 10 to save mobile performance

              return (
                <motion.tr
                  key={gambler.id}
                  className={`table-row ${rank <= 3 ? `rank-${rank}` : ''}`}
                  initial={shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: shouldAnimate ? index * 0.05 : 0 }}
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
                    <span className="nickname-text">{gambler.nickname}</span>
                  </td>
                  <td className="col-total">
                    <span className={`total-score ${getScoreClass(gambler.totalScore)}`}>
                      {gambler.totalScore > 0 && '+'}
                      {gambler.totalScore}
                    </span>
                  </td>
                  {gambler.matchScores.map((score, idx) => (
                    <td key={idx} className="col-match">
                      <span className={`event-points ${getScoreClass(score)}`}>
                        {score > 0 && '+'}
                        {score}
                      </span>
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaderboard;