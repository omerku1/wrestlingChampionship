import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatScore, getScoreClass } from '../utils/formatScore';
import './Leaderboard.css';

// ---------------------------------------------------------------------------
// Pure table row — memoised to skip re-render if props are unchanged
// ---------------------------------------------------------------------------
const LeaderboardRow = memo(function LeaderboardRow({ gambler, rank, matchHeaders }) {
  const rankIcon =
    rank === 1 ? '🥇' :
    rank === 2 ? '🥈' :
    rank === 3 ? '🥉' : null;

  const rankClass = rank <= 3 ? `rank-${rank}` : '';

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
        <span className="nickname-text">{gambler.nickname}</span>
      </td>
      <td className="col-total">
        <span className={`total-score ${getScoreClass(gambler.totalScore)}`}>
          {formatScore(gambler.totalScore)}
        </span>
      </td>
      {gambler.matchScores.map((score, idx) => (
        <td key={idx} className="col-match">
          <span className={`event-points ${getScoreClass(score)}`}>
            {formatScore(score)}
          </span>
        </td>
      ))}
      {gambler.individualScores.length > 0 && (
        <td className="col-individuals-total">
          <span className={`individuals-total-score ${getScoreClass(
            gambler.individualsData ? Object.values(gambler.individualsData).reduce((s, v) => s + v, 0) : 0
          )}`}>
            {formatScore(
              gambler.individualsData
                ? Object.values(gambler.individualsData).reduce((s, v) => s + v, 0)
                : 0
            )}
          </span>
        </td>
      )}
      {gambler.individualScores.map((individual, idx) => (
        <td key={`ind-${idx}`} className="col-individual">
          <span className={`individual-score ${getScoreClass(individual.score)}`}>
            {formatScore(individual.score)}
          </span>
        </td>
      ))}
    </tr>
  );
});

// ---------------------------------------------------------------------------
// Mobile card — rank, nickname, total score, per-match breakdown
// ---------------------------------------------------------------------------
const MobileLeaderboardCard = memo(function MobileLeaderboardCard({ gambler, rank, matchHeaders }) {
  const rankIcon =
    rank === 1 ? '🥇' :
    rank === 2 ? '🥈' :
    rank === 3 ? '🥉' : null;

  const rankClass = rank <= 3 ? `rank-${rank}` : '';

  return (
    <div className={`mobile-event-lb-card ${rankClass}`}>
      <div className="mobile-event-lb-top">
        <div className="mobile-event-lb-rank">
          {rankIcon
            ? <span className="rank-medal">{rankIcon}</span>
            : <span className="rank-number">#{rank}</span>
          }
        </div>
        <div className="mobile-event-lb-identity">
          <span className="nickname-text">{gambler.nickname}</span>
        </div>
        <div className="mobile-event-lb-total">
          <span className={`total-score ${getScoreClass(gambler.totalScore)}`}>
            {formatScore(gambler.totalScore)}
          </span>
        </div>
      </div>
      {gambler.matchScores.length > 0 && (
        <div className="mobile-event-lb-matches">
          {gambler.matchScores.map((score, idx) => (
            <div key={idx} className="mobile-event-lb-match-row">
              <span className="mobile-event-lb-match-name">
                {matchHeaders[idx] || `Match ${idx + 1}`}
              </span>
              <span className={`event-points ${getScoreClass(score)}`}>
                {formatScore(score)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// ---------------------------------------------------------------------------
// Main Leaderboard component
// ---------------------------------------------------------------------------
function Leaderboard({ eventData }) {
  const leaderboardData = useMemo(() => {
    const scores = {};

    const gamblersArray = Array.isArray(eventData.gamblers)
      ? eventData.gamblers
      : Object.entries(eventData.gamblers).map(([id, gambler]) => ({ id, ...gambler }));

    gamblersArray.forEach(gambler => {
      scores[gambler.id] = {
        nickname: gambler.nickname,
        totalScore: 0,
        matchScores: [],
        individualScores: [],
        individualsData: {}
      };
    });

    const hasMatchDetails = eventData.matchDetails && Array.isArray(eventData.matchDetails);
    const hasMatches = eventData.matches && Array.isArray(eventData.matches);

    if (hasMatchDetails && gamblersArray[0]?.matches) {
      Object.values(eventData.matchDetails).forEach((match) => {
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
      eventData.matches.forEach(match => {
        match.gamblersResult?.forEach(result => {
          if (scores[result.id]) {
            scores[result.id].totalScore += result.result;
            scores[result.id].matchScores.push(result.result);
          }
        });
      });
    }

    gamblersArray.forEach(gambler => {
      if (gambler.individuals) {
        scores[gambler.id].individualsData = gambler.individuals;
        const individualTotal = Object.values(gambler.individuals).reduce((sum, val) => sum + val, 0);
        scores[gambler.id].totalScore += individualTotal;
        scores[gambler.id].individualScores = Object.entries(gambler.individuals).map(([key, val]) => ({
          name: key,
          score: val
        }));
      }
    });

    return Object.entries(scores)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [eventData]);

  // Build match header labels for mobile cards
  const matchHeaders = useMemo(() => {
    const source = eventData.matchDetails || eventData.matches || [];
    return source.map(m => m['match name'] || '');
  }, [eventData]);

  const hasIndividuals = leaderboardData[0]?.individualScores.length > 0;

  return (
    <div className="leaderboard">
      {/* ----------------------------------------------------------------
          Desktop table — hidden below 640 px via CSS
          -------------------------------------------------------------- */}
      <div className="desktop-event-leaderboard">
        <div className="leaderboard-table-container">
          <table className="leaderboard-table">
            <caption className="visually-hidden">
              Event leaderboard — gamblers ranked by total score for this event
            </caption>
            <thead>
              <tr>
                <th className="col-rank" scope="col">Rank</th>
                <th className="col-nickname" scope="col">Nickname</th>
                <th className="col-total" scope="col">Total</th>
                {(eventData.matchDetails || eventData.matches || []).map((match, idx) => (
                  <th key={idx} className="col-match" scope="col">
                    {match['match name']}
                  </th>
                ))}
                {hasIndividuals && (
                  <>
                    <th className="col-individuals-total" scope="col">Individuals</th>
                    {leaderboardData[0].individualScores.map((individual, idx) => (
                      <th key={`header-${idx}`} className="col-individual-header" scope="col">
                        {individual.name.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((gambler, index) => (
                <LeaderboardRow
                  key={gambler.id}
                  gambler={gambler}
                  rank={index + 1}
                  matchHeaders={matchHeaders}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------------------------------------------------------
          Mobile card list — shown only below 640 px via CSS
          -------------------------------------------------------------- */}
      <div className="mobile-event-leaderboard">
        {leaderboardData.map((gambler, index) => (
          <MobileLeaderboardCard
            key={gambler.id}
            gambler={gambler}
            rank={index + 1}
            matchHeaders={matchHeaders}
          />
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;
