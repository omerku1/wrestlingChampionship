import { useMemo } from 'react';
import './EventStats.css';

// Helper function to convert duration string (e.g., "56:10" or "1:07:00") to total minutes
function durationToMinutes(duration) {
  if (typeof duration === 'number') {
    return duration; // Handle old format for backwards compatibility
  }

  const parts = duration.split(':');

  if (parts.length === 3) {
    // Format: "H:MM:SS"
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    return hours * 60 + minutes + seconds / 60;
  } else if (parts.length === 2) {
    // Format: "MM:SS"
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes + seconds / 60;
  }

  return 0;
}

function EventStats({ eventData }) {
  const statistics = useMemo(() => {
    // Determine which format is being used
    const matches = eventData.matchDetails || eventData.matches || [];
    const gamblersArray = Array.isArray(eventData.gamblers)
      ? eventData.gamblers
      : Object.entries(eventData.gamblers).map(([id, gambler]) => ({
          id,
          ...gambler
        }));

    let positiveScores = 0;
    let negativeScores = 0;
    let titleChanges = 0;

    const durations = [];
    const ratings = [];

    matches.forEach(match => {
      // Count title changes
      if (match.titleChange) {
        titleChanges++;
      }

      // Collect durations and ratings
      durations.push({
        original: match.duration,
        minutes: durationToMinutes(match.duration)
      });
      ratings.push(match.rating);

      // Count positive/negative predictions (old format only)
      if (match.gamblersResult) {
        match.gamblersResult.forEach(result => {
          if (result.result > 0) positiveScores++;
          else if (result.result < 0) negativeScores++;
        });
      }
    });

    const totalPredictions = gamblersArray.length * matches.length;
    const accuracyRate = ((positiveScores / totalPredictions) * 100).toFixed(0);

    // Calculate match statistics
    const durationMinutes = durations.map(d => d.minutes);
    const longestMatchMinutes = Math.max(...durationMinutes);
    const shortestMatchMinutes = Math.min(...durationMinutes);
    const highestRating = Math.max(...ratings);
    const lowestRating = Math.min(...ratings);

    // Find match names and original duration strings
    const longestMatchData = matches.find(m => durationToMinutes(m.duration) === longestMatchMinutes);
    const shortestMatchData = matches.find(m => durationToMinutes(m.duration) === shortestMatchMinutes);
    const longestMatchName = longestMatchData?.['match name'] || 'N/A';
    const shortestMatchName = shortestMatchData?.['match name'] || 'N/A';
    const highestRatingMatchName = matches.find(m => m.rating === highestRating)?.['match name'] || 'N/A';
    const lowestRatingMatchName = matches.find(m => m.rating === lowestRating)?.['match name'] || 'N/A';

    // Calculate top performer
    const gamblerStats = {};
    gamblersArray.forEach(gambler => {
      gamblerStats[gambler.id] = {
        nickname: gambler.nickname,
        totalScore: 0
      };
    });

    // Calculate scores based on format
    if (matches[0]?.gamblersResult) {
      // Old format
      matches.forEach(match => {
        match.gamblersResult.forEach(result => {
          if (gamblerStats[result.id]) {
            gamblerStats[result.id].totalScore += result.result;
          }
        });
      });
    } else {
      // New format - sum from matches object
      gamblersArray.forEach(gambler => {
        if (gambler.matches) {
          Object.values(gambler.matches).forEach(score => {
            gamblerStats[gambler.id].totalScore += score || 0;
          });
        }
        // Add individual scores if they exist
        if (gambler.individuals) {
          Object.values(gambler.individuals).forEach(score => {
            gamblerStats[gambler.id].totalScore += score || 0;
          });
        }
      });
    }

    const gamblerArray = Object.values(gamblerStats);
    const bestGambler = gamblerArray.reduce((best, curr) =>
      curr.totalScore > best.totalScore ? curr : best
    );

    return {
      accuracyRate,
      bestGambler,
      numberOfMatches: matches.length,
      titleChanges,
      longestMatch: { name: longestMatchName, duration: longestMatchData?.duration || 'N/A' },
      shortestMatch: { name: shortestMatchName, duration: shortestMatchData?.duration || 'N/A' },
      highestRatingMatch: { name: highestRatingMatchName, rating: highestRating },
      lowestRatingMatch: { name: lowestRatingMatchName, rating: lowestRating }
    };
  }, [eventData]);

  return (
    <div className="event-stats-cards">

      <div className="event-stat-card">
        <div className="stat-label">Top Performer</div>
        <div className="stat-value stat-value-nickname">{statistics.bestGambler.nickname}</div>
        <div className="stat-subtext">+{statistics.bestGambler.totalScore} pts</div>
      </div>

      <div className="event-stat-card">
        <div className="stat-label">Number of Matches</div>
        <div className="stat-value">{statistics.numberOfMatches}</div>
      </div>

      <div className="event-stat-card">
        <div className="stat-label">Title Changes</div>
        <div className="stat-value">{statistics.titleChanges}</div>
      </div>

      <div className="event-stat-card">
        <div className="stat-label">Longest Match</div>
        <div className="stat-value">{statistics.longestMatch.duration}</div>
        <div className="stat-subtext-small">{statistics.longestMatch.name}</div>
      </div>

      <div className="event-stat-card">
        <div className="stat-label">Shortest Match</div>
        <div className="stat-value">{statistics.shortestMatch.duration}</div>
        <div className="stat-subtext-small">{statistics.shortestMatch.name}</div>
      </div>

      <div className="event-stat-card">
        <div className="stat-label">Highest Rating</div>
        <div className="stat-value">{statistics.highestRatingMatch.rating}</div>
        <div className="stat-subtext-small">{statistics.highestRatingMatch.name}</div>
      </div>

      <div className="event-stat-card">
        <div className="stat-label">Lowest Rating</div>
        <div className="stat-value">{statistics.lowestRatingMatch.rating}</div>
        <div className="stat-subtext-small">{statistics.lowestRatingMatch.name}</div>
      </div>
    </div>
  );
}

export default EventStats;

