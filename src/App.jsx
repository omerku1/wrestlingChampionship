import { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const EventPage = lazy(() => import('./pages/EventPage'));

function AppFallback() {
  return (
    <div className="app-suspense-fallback" role="status" aria-label="Loading page">
      <div className="app-suspense-spinner" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        {/* Static ambient background — no JS animation */}
        <div className="bg-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>

        <div className="container">
          <Suspense fallback={<AppFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/event/:eventFile" element={<EventPage />} />
              <Route path="/event/next/:eventName" element={<EventPage />} />
              <Route path="/event/upcoming/:eventName" element={<EventPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Router>
  );
}

export default App;
