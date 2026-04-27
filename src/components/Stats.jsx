import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Award, Target } from 'lucide-react';
import { formatScore } from '../utils/formatScore';
import './Stats.css';

const Stats = memo(function Stats({ eventData }) {
  const statistics = useMemo(() => {
    const matches = eventData.matchDetails || eventData.matches || [];
    const gamblersArray = Array.isArray(eventData.gamblers)
      ? eventData.gamblers
      : Object.entries(eventData.gamblers).map(([id, gambler]) => ({ id, ...gambler }));

    let totalPoints = 0;
    let positiveScores = 0;
    let negativeScores = 0;
    let perfectPredictions = 0;
    const scoreDistribution = {};

    if (matches[0]?.gamblersResult) {
      matches.forEach(match => {
        totalPoints += match['match score'];
        match.gamblersResult.forEach(result => {
          if (result.result > 0) positiveScores++;
          else if (result.result < 0) negativeScores++;
          if (result.result === match['match score']) perfectPredictions++;
          scoreDistribution[result.result] = (scoreDistribution[result.result] || 0) + 1;
        });
      });
    } else {
      matches.forEach(match => {
        totalPoints += match['match score'];
        gamblersArray.forEach(gambler => {
          const matchName = match['match name'];
          const result = gambler.matches?.[matchName] || 0;
          if (result !== 0) {
            if (result > 0) positiveScores++;
            else if (result < 0) negativeScores++;
            if (result === match['match score']) perfectPredictions++;
            scoreDistribution[result] = (scoreDistribution[result] || 0) + 1;
          }
        });
      });
    }

    const avgMatchValue = (totalPoints / matches.length).toFixed(1);
    const totalPredictions = gamblersArray.length * matches.length;
    const accuracyRate = ((positiveScores / totalPredictions) * 100).toFixed(1);

    const gamblerStats = {};
    gamblersArray.forEach(gambler => {
      gamblerStats[gambler.id] = {
        nickname: gambler.nickname,
        totalScore: 0,
        wins: 0,
        losses: 0
      };
    });

    if (matches[0]?.gamblersResult) {
      matches.forEach(match => {
        match.gamblersResult.forEach(result => {
          if (gamblerStats[result.id]) {
            gamblerStats[result.id].totalScore += result.result;
            if (result.result > 0) gamblerStats[result.id].wins++;
            else if (result.result < 0) gamblerStats[result.id].losses++;
          }
        });
      });
    } else {
      gamblersArray.forEach(gambler => {
        matches.forEach(match => {
          const matchName = match['match name'];
          const result = gambler.matches?.[matchName] || 0;
          gamblerStats[gambler.id].totalScore += result;
          if (result > 0) gamblerStats[gambler.id].wins++;
          else if (result < 0) gamblerStats[gambler.id].losses++;
        });
        if (gambler.individuals) {
          Object.values(gambler.individuals).forEach(score => {
            gamblerStats[gambler.id].totalScore += score || 0;
          });
        }
      });
    }

    const gamblerArray = Object.values(gamblerStats);
    const bestGambler = gamblerArray.reduce((best, curr) => curr.totalScore > best.totalScore ? curr : best);
    const worstGambler = gamblerArray.reduce((worst, curr) => curr.totalScore < worst.totalScore ? curr : worst);
    const mostWins = gamblerArray.reduce((most, curr) => curr.wins > most.wins ? curr : most);

    return {
      totalPoints,
      avgMatchValue,
      positiveScores,
      negativeScores,
      accuracyRate,
      perfectPredictions,
      totalPredictions,
      bestGambler,
      worstGambler,
      mostWins,
      scoreDistribution
    };
  }, [eventData]);

  const positivePct = statistics.totalPredictions > 0
    ? `${((statistics.positiveScores / statistics.totalPredictions) * 100).toFixed(1)}%`
    : '0%';
  const negativePct = statistics.totalPredictions > 0
    ? `${((statistics.negativeScores / statistics.totalPredictions) * 100).toFixed(1)}%`
    : '0%';

  return (
    <div className="stats">
      <motion.div
        className="stats-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <TrendingUp size={32} aria-hidden="true" />
        <h2>Event Statistics</h2>
      </motion.div>

      <div className="stats-grid">
        {/* Overview Stats */}
        <motion.div
          className="stat-card large"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-card-icon">
            <BarChart3 size={32} aria-hidden="true" />
          </div>
          <div className="stat-card-content">
            <h3>Event Overview</h3>
            <div className="overview-grid">
              <div className="overview-item">
                <span className="overview-label">Total Matches</span>
                <span className="overview-value">{eventData.matches.length}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Total Gamblers</span>
                <span className="overview-value">{eventData.gamblers.length}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Total Predictions</span>
                <span className="overview-value">{statistics.totalPredictions}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Avg Match Value</span>
                <span className="overview-value">{statistics.avgMatchValue} pts</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Accuracy Rate */}
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-card-icon success">
            <Target size={32} aria-hidden="true" />
          </div>
          <div className="stat-card-content">
            <h3>Accuracy Rate</h3>
            <div className="stat-value success">{statistics.accuracyRate}%</div>
            <div className="stat-description">{statistics.positiveScores} correct predictions</div>
          </div>
        </motion.div>

        {/* Perfect Predictions */}
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-card-icon gold">
            <Award size={32} aria-hidden="true" />
          </div>
          <div className="stat-card-content">
            <h3>Perfect Predictions</h3>
            <div className="stat-value gold">{statistics.perfectPredictions}</div>
            <div className="stat-description">Full match score earned</div>
          </div>
        </motion.div>

        {/* Best Gambler */}
        <motion.div
          className="stat-card highlight"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="stat-card-header">
            <h3>Top Performer</h3>
          </div>
          <div className="champion-info">
            <div className="champion-name">{statistics.bestGambler.nickname}</div>
            <div className="champion-score">{formatScore(statistics.bestGambler.totalScore)} points</div>
            <div className="champion-record">
              {statistics.bestGambler.wins}W - {statistics.bestGambler.losses}L
            </div>
          </div>
        </motion.div>

        {/* Most Wins */}
        <motion.div
          className="stat-card highlight"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="stat-card-header">
            <h3>Most Wins</h3>
          </div>
          <div className="champion-info">
            <div className="champion-name">{statistics.mostWins.nickname}</div>
            <div className="champion-wins">{statistics.mostWins.wins} Victories</div>
            <div className="champion-record">
              Total: {formatScore(statistics.mostWins.totalScore)} pts
            </div>
          </div>
        </motion.div>

        {/* Performance Distribution — CSS-driven bar width, no Framer Motion */}
        <motion.div
          className="stat-card large"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="stat-card-header">
            <h3>Performance Distribution</h3>
          </div>
          <div className="distribution-bars">
            <div className="distribution-item">
              <span className="distribution-label">Positive Scores</span>
              <div className="distribution-bar-container">
                <div
                  className="distribution-bar success css-bar"
                  style={{ '--bar-width': positivePct }}
                />
              </div>
              <span className="distribution-value">{statistics.positiveScores}</span>
            </div>
            <div className="distribution-item">
              <span className="distribution-label">Negative Scores</span>
              <div className="distribution-bar-container">
                <div
                  className="distribution-bar danger css-bar"
                  style={{ '--bar-width': negativePct }}
                />
              </div>
              <span className="distribution-value">{statistics.negativeScores}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

export default Stats;
