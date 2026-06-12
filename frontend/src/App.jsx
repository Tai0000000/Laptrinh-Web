import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import RaceDetail from './pages/RaceDetail';
import Predictions from './pages/Predictions';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import { SocketProvider } from './context/SocketContext';

// Horse Owner Pages
import Blank from './pages/Blank';
import Dashboard from './pages/HorseOwner/Dashboard';
import MyHorses from './pages/HorseOwner/MyHorses';
import MyJockeys from './pages/HorseOwner/MyJockeys';

import RaceRegistrations from './pages/HorseOwner/RaceRegistrations';
import TournamentsRaces from './pages/HorseOwner/TournamentsRaces';
import ResultsRewards from './pages/HorseOwner/ResultsRewards';
import AccountSettings from './pages/HorseOwner/AccountSettings';

// Referee Pages
import RefereeDashboard from './pages/Referee/Dashboard';
import RefereeRaces from './pages/Referee/Races';
import RefereeViolations from './pages/Referee/Violations';
import RefereeSchedule from './pages/Referee/Schedule';

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="min-h-screen bg-transparent">
          <Navbar />
          <main>
            <Routes>
              {/* Main Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/tournaments/:id" element={<TournamentDetail />} />
              <Route path="/races/:id" element={<RaceDetail />} />

              <Route path="/predictions" element={<Predictions />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Horse Owner Dashboard Routes */}
              <Route path="/blank" element={<Blank />} /> 
              <Route path="/horse-owner/dashboard" element={<Dashboard />} />
              <Route path="/horse-owner/horses" element={<MyHorses />} />
              <Route path="/horse-owner/jockeys" element={<MyJockeys />} />
              <Route path="/horse-owner/race-registrations" element={<RaceRegistrations />} />
              <Route path="/horse-owner/tournaments-races" element={<TournamentsRaces />} />
              <Route path="/horse-owner/results-rewards" element={<ResultsRewards />} />
              <Route path="/horse-owner/settings" element={<AccountSettings />} />

              {/* Referee Dashboard Routes */}
              <Route path="/referee/dashboard" element={<RefereeDashboard />} />
              <Route path="/referee/races" element={<RefereeRaces />} />
              <Route path="/referee/violations" element={<RefereeViolations />} />
              <Route path="/referee/schedule" element={<RefereeSchedule />} />

            </Routes>
          </main>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;