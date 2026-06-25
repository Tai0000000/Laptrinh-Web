import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Main Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import RaceDetail from './pages/RaceDetail';
import Predictions from './pages/Predictions';
import SpectatorDashboard from './pages/Dashboard';
import Blank from './pages/Blank';

// Horse Owner Pages
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
import RefereeResultEntry from './pages/Referee/ResultEntry';
import RefereeMonitor from './pages/Referee/Monitor';
import RefereeHistory from './pages/Referee/History';

// Jockey Pages
import JockeyOverview from './pages/jockey/JockeyOverview';
import JockeyInvitations from './pages/jockey/JockeyInvitations';
import JockeySchedule from './pages/jockey/JockeySchedule';
import JockeyPerformance from './pages/jockey/JockeyPerformance';
import JockeySidebar from './components/Jockey/JockeySidebar';

function JockeyPortal() {
  const [page, setPage] = React.useState('overview');
  return (
    <div style={{ background: '#131315', minHeight: '100vh', display: 'flex' }}>
      <JockeySidebar active={page} setPage={setPage} />
      {page === 'overview' && <JockeyOverview />}
      {page === 'schedule' && <JockeySchedule />}
      {page === 'invitations' && <JockeyInvitations />}
      {page === 'performance' && <JockeyPerformance />}
    </div>
  );
}

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
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <main>
          <Routes>
            {/* Main Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={<Dashboard />} />
            {/* Add role-specific routes here */}

            <Route path="/register" element={<Register />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/:id" element={<TournamentDetail />} />
            <Route path="/races/:id" element={<RaceDetail />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/dashboard" element={<SpectatorDashboard />} />
            <Route path="/blank" element={<Blank />} />
            
            {/* Horse Owner Routes */}
            <Route path="/horse-owner/dashboard" element={<HorseOwnerDashboard />} />
            <Route path="/horse-owner/horses" element={<MyHorses />} />
            <Route path="/horse-owner/jockeys" element={<MyJockeys />} />
            <Route path="/horse-owner/race-registrations" element={<RaceRegistrations />} />
            <Route path="/horse-owner/tournaments-races" element={<TournamentsRaces />} />
            <Route path="/horse-owner/results-rewards" element={<ResultsRewards />} />
            <Route path="/horse-owner/settings" element={<AccountSettings />} />

            {/* Jockey Routes */}
            <Route path="/jockey/*" element={<JockeyPortal />} />

            {/* Referee Routes */}
            <Route path="/referee/dashboard" element={<RefereeDashboard />} />
            <Route path="/referee/races" element={<RefereeRaces />} />
            <Route path="/referee/violations" element={<RefereeViolations />} />
            <Route path="/referee/schedule" element={<RefereeSchedule />} />
            <Route path="/referee/races/:raceId/results" element={<RefereeResultEntry />} />
            <Route path="/referee/races/:raceId/monitor" element={<RefereeMonitor />} />
            <Route path="/referee/history" element={<RefereeHistory />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
