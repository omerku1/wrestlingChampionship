import { motion } from 'framer-motion';
import { useMemo } from 'react';
import './Leaderboard.css';

function Leaderboard({ eventData }) {
  const leaderboardData = useMemo(() => {
    const scores = {};

    // Check if gamblers is an object (new format) or array (old format)
    const gamblersArray = Array.isArray(eventData.gamblers)
      ? eventData.gamblers
      : Object.entries(eventData.gamblers).map(([id, gambler]) => ({
          id,
          ...gambler
        }));

    // Initialize scores for each gambler
    gamblersArray.forEach(gambler => {
      scores[gambler.id] = {
        nickname: gambler.nickname,
        totalScore: 0,
        matchScores: [],
        individualScores: [],
        individualsData: {}
      };
    });

    // Check if using new format (matchDetails + matches scores) or old format (matches + gamblersResult)
    const hasMatchDetails = eventData.matchDetails && Array.isArray(eventData.matchDetails);
    const hasMatches = eventData.matches && Array.isArray(eventData.matches);

    if (hasMatchDetails && gamblersArray[0]?.matches) {
      // New format: matches object with scores per match
      Object.values(eventData.matchDetails).forEach((match, idx) => {
        gamblersArray.forEach(gambler => {
          const matchName = match['match name'];
          const score = gambler.matches?.[matchName] || 0;
          if (scores[gambler.id]) {
            scores[gambler.id].totalScore += score;
            scores[gambler.id].matchScores.push(score);
          }
        });
      });
    } else if (hasMatches) {
      // Old format: gamblersResult array
      eventData.matches.forEach(match => {
        match.gamblersResult?.forEach(result => {
          if (scores[result.id]) {
            scores[result.id].totalScore += result.result;
            scores[result.id].matchScores.push(result.result);
          }
        });
      });
    }

    // Calculate individual scores if they exist
    gamblersArray.forEach(gambler => {
      if (gambler.individuals) {
        scores[gambler.id].individualsData = gambler.individuals;
        // Sum all individual scores
        const individualTotal = Object.values(gambler.individuals).reduce((sum, val) => sum + val, 0);
        scores[gambler.id].totalScore += individualTotal;
        scores[gambler.id].individualScores = Object.entries(gambler.individuals).map(([key, val]) => ({
          name: key,
          score: val
        }));
      }
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
              {(eventData.matchDetails || eventData.matches || []).map((match, idx) => (
                <th key={idx} className="col-match">
                  {match['match name']}
                </th>
              ))}
              {leaderboardData[0]?.individualScores.length > 0 && (
                <>
                  <th className="col-individuals-total">Individuals</th>
                  {leaderboardData[0].individualScores.map((individual, idx) => (
                    <th key={`header-${idx}`} className="col-individual-header">
                      {individual.name.replace(/_/g, ' ')}
                    </th>
                  ))}
                </>
              )}
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
                  {gambler.individualScores.length > 0 && (
                    <td className="col-individuals-total">
                      <span className={`individuals-total-score ${getScoreClass(gambler.individualsData && Object.values(gambler.individualsData).reduce((sum, val) => sum + val, 0))}`}>
                        {(() => {
                          const total = gambler.individualsData && Object.values(gambler.individualsData).reduce((sum, val) => sum + val, 0);
                          return total > 0 ? '+' + total : total;
                        })()}
                      </span>
                    </td>
                  )}
                  {gambler.individualScores.map((individual, idx) => (
                    <td key={`ind-${idx}`} className="col-individual">
                      <span className={`individual-score ${getScoreClass(individual.score)}`}>
                        {individual.score > 0 && '+'}
                        {individual.score}
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