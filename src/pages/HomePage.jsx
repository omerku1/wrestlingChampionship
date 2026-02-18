import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlobalLeaderboard from '../components/GlobalLeaderboard';
import './HomePage.css';

function HomePage() {
  const [seasonData, setSeasonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load season data directly
    fetch('/data/global_leaderboard.json')
      .then(res => res.json())
      .then(data => {
        setSeasonData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading season data:', err);
        setLoading(false);
      });
  }, []); // Empty dependency array = runs once on mount

  if (loading) {
    return (
      <div className="page-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          🏆
        </motion.div>
        <p>Loading Season Data...</p>
      </div>
    );
  }

  if (!seasonData) {
    return (
      <div className="page-error">
        <h1>Failed to load season data</h1>
        <p>Please check if global_leaderboard.json is in the public/data folder</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <GlobalLeaderboard seasonData={seasonData} />
    </div>
  );
}

export default HomePage;

