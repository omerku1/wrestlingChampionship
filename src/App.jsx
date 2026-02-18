import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import HomePage from './pages/HomePage';
import EventPage from './pages/EventPage';
import './App.css';

function App() {
  return (
    <Router basename="/wrestlingChampionship">
      <div className="app">
        {/* Animated background elements */}
        <div className="bg-orbs">
          <motion.div
            className="orb orb-1"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="orb orb-2"
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="orb orb-3"
            animate={{
              x: [0, 50, 0],
              y: [0, -50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/event/:eventFile" element={<EventPage />} />
            <Route path="/event/next/:eventName" element={<EventPage />} />
            <Route path="/event/upcoming/:eventName" element={<EventPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

