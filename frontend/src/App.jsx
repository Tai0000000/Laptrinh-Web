import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import RaceDetail from './pages/RaceDetail';
import Predictions from './pages/Predictions';
import SpectatorDashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import { SocketProvider } from './context/SocketContext';
import { useAuth } from './context/AuthContext';

// Horse Owner Pages
import Blank from './pages/Blank';
import HorseOwnerDashboard from './pages/HorseOwner/Dashboard';
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

// Jockey Pages
import JockeyOverview from './pages/jockey/JockeyOverview';
import JockeySchedule from './pages/jockey/JockeySchedule';
import JockeyInvitations from './pages/jockey/JockeyInvitations';
import JockeyPerformance from './pages/jockey/JockeyPerformance';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <SocketProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Navbar />
          <main>
            <Routes>
              {/* Main Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/tournaments/:id" element={<TournamentDetail />} />
              <Route path="/races/:id" element={<RaceDetail />} />

              <Route path="/predictions" element={<Predictions />} />
              <Route path="/dashboard" element={<SpectatorDashboard />} />
              
              {/* Horse Owner Dashboard Routes */}
              <Route path="/blank" element={<Blank />} /> 
              <Route path="/horse-owner/dashboard" element={<HorseOwnerDashboard />} />
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

              {/* Jockey Dashboard Routes */}
              <Route path="/jockey/overview" element={<JockeyOverview />} />
              <Route path="/jockey/schedule" element={<JockeySchedule />} />
              <Route path="/jockey/invitations" element={<JockeyInvitations />} />
              <Route path="/jockey/performance" element={<JockeyPerformance />} />
              <Route path="/jockey/dashboard" element={<JockeyOverview />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;