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

              return (
                <tr key={gambler.id} className="leaderboard-row">
                  <td className="col-rank">
                    <span className="rank-badge">#{rank}</span>
                  </td>
                  <td className="col-nickname">{gambler.nickname}</td>
                  <td className="col-total">
                    <span className={`total-score ${getScoreClass(gambler.totalScore)}`}>
                      {gambler.totalScore > 0 && '+'}
                      {gambler.totalScore}
                    </span>
                  </td>
                  {gambler.matchScores.map((score, idx) => (
                    <td key={idx} className="col-match">
                      <span className={`match-score ${getScoreClass(score)}`}>
                        {score > 0 && '+'}
                        {score}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaderboard;

