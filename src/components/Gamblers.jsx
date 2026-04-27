import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { formatScore, getScoreClass } from '../utils/formatScore.js';
import './Gamblers.css';

// ---------------------------------------------------------------------------
// Pure match result row — CSS transition only
// ---------------------------------------------------------------------------
const MatchResultItem = memo(function MatchResultItem({ match }) {
  return (
    <div className="match-result-item">
      <div className="match-result-name">{match.matchName}</div>
      <div className={`match-result-score ${getScoreClass(match.result)}`}>
        {formatScore(match.result)}
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Pure gambler card — entrance animation only, no continuous motion
// ---------------------------------------------------------------------------
const GamblerCard = memo(function GamblerCard({ gambler, index }) {
  return (
    <motion.div
      className="gambler-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="gambler-card-header">
        <div className="gambler-avatar" aria-hidden="true">
          {gambler.nickname.charAt(0).toUpperCase()}
        </div>
        <div className="gambler-identity">
          <h3 className="gambler-nickname">{gambler.nickname}</h3>
          <p className="gambler-email">{gambler.id}</p>
        </div>
      </div>

      <div className={`gambler-total-score ${getScoreClass(gambler.totalScore)}`}>
        <span className="score-value">{formatScore(gambler.totalScore)}</span>
        <span className="score-label">Total Points</span>
      </div>

      <div className="gambler-stats-row">
        <div className="stat-item wins">
          <TrendingUp size={20} aria-hidden="true" />
          <div>
            <div className="stat-value">{gambler.wins}</div>
            <div className="stat-label">Wins</div>
          </div>
        </div>
        <div className="stat-item losses">
          <TrendingDown size={20} aria-hidden="true" />
          <div>
            <div className="stat-value">{gambler.losses}</div>
            <div className="stat-label">Losses</div>
          </div>
        </div>
        {gambler.draws > 0 && (
          <div className="stat-item draws">
            <Award size={20} aria-hidden="true" />
            <div>
              <div className="stat-value">{gambler.draws}</div>
              <div className="stat-label">Draws</div>
            </div>
          </div>
        )}
      </div>

      <div className="gambler-matches">
        <h4>Match Performance</h4>
        <div className="matches-list">
          {gambler.matchResults.map((match, idx) => (
            <MatchResultItem key={idx} match={match} />
          ))}
        </div>
      </div>
    </motion.div>
  );
});

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
function Gamblers({ eventData }) {
  const gamblersData = useMemo(() => {
    const scores = {};

    const gamblersArray = Array.isArray(eventData.gamblers)
      ? eventData.gamblers
      : Object.entries(eventData.gamblers).map(([id, gambler]) => ({ id, ...gambler }));

    const matches = eventData.matchDetails || eventData.matches || [];

    gamblersArray.forEach(gambler => {
      scores[gambler.id] = {
        nickname: gambler.nickname,
        totalScore: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        matchResults: []
      };
    });

    if (matches[0]?.gamblersResult) {
      matches.forEach(match => {
        match.gamblersResult.forEach(result => {
          if (scores[result.id]) {
            scores[result.id].totalScore += result.result;
            scores[result.id].matchResults.push({
              matchName: match['match name'],
              result: result.result,
              matchScore: match['match score']
            });
            if (result.result > 0) scores[result.id].wins++;
            else if (result.result < 0) scores[result.id].losses++;
            else scores[result.id].draws++;
          }
        });
      });
    } else {
      gamblersArray.forEach(gambler => {
        if (gambler.matches) {
          matches.forEach(match => {
            const matchName = match['match name'];
            const result = gambler.matches[matchName] || 0;
            scores[gambler.id].matchResults.push({
              matchName,
              result,
              matchScore: match['match score']
            });
            scores[gambler.id].totalScore += result;
            if (result > 0) scores[gambler.id].wins++;
            else if (result < 0) scores[gambler.id].losses++;
            else scores[gambler.id].draws++;
          });
        }
        if (gambler.individuals) {
          Object.entries(gambler.individuals).forEach(([, value]) => {
            scores[gambler.id].totalScore += value || 0;
          });
        }
      });
    }

    return Object.entries(scores)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [eventData]);

  return (
    <div className="gamblers">
      <motion.div
        className="gamblers-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Users size={32} aria-hidden="true" />
        <h2>All Gamblers</h2>
      </motion.div>

      <div className="gamblers-grid">
        {gamblersData.map((gambler, index) => (
          <GamblerCard key={gambler.id} gambler={gambler} index={index} />
        ))}
      </div>
    </div>
  );
}

export default Gamblers;
