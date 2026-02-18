import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlobalLeaderboard from '../components/GlobalLeaderboard';
import seasonData from '../data/global_leaderboard.json';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <GlobalLeaderboard seasonData={seasonData} />
    </div>
  );
}

export default HomePage;

