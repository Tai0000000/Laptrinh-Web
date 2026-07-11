import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import { SocketProvider } from './context/SocketContext';

// ── Auth ──────────────────────────────────────────────────────────────────
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';

// ── Public Pages ─────────────────────────────────────────────────────────
import Home from './pages/Home';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import RaceDetail from './pages/RaceDetail';
import Predictions from './pages/Predictions';

// ── Admin / Dashboard ─────────────────────────────────────────────────────
import AdminPanel from './pages/Dashboard';

// ── Horse Owner Pages ─────────────────────────────────────────────────────
import HorseOwnerDashboard from './pages/HorseOwner/Dashboard';
import MyHorses from './pages/HorseOwner/MyHorses';
import MyJockeys from './pages/HorseOwner/MyJockeys';
import RaceRegistrations from './pages/HorseOwner/RaceRegistrations';
import TournamentsRaces from './pages/HorseOwner/TournamentsRaces';
import ResultsRewards from './pages/HorseOwner/ResultsRewards';
import AccountSettings from './pages/HorseOwner/AccountSettings';

// ── Referee Pages ─────────────────────────────────────────────────────────
import RefereeDashboard from './pages/Referee/Dashboard';
import RefereeRaces from './pages/Referee/Races';
import RefereeViolations from './pages/Referee/Violations';
import RefereeSchedule from './pages/Referee/Schedule';
import RefereeResultEntry from './pages/Referee/ResultEntry';
import RefereeMonitor from './pages/Referee/Monitor';
import RefereeHistory from './pages/Referee/History';

// ── Jockey Pages ──────────────────────────────────────────────────────────
import JockeyOverview from './pages/jockey/JockeyOverview';
import JockeyInvitations from './pages/jockey/JockeyInvitations';
import JockeySchedule from './pages/jockey/JockeySchedule';
import JockeyPerformance from './pages/jockey/JockeyPerformance';
import JockeyLive from './pages/jockey/JockeyLive';
import JockeySidebar from './components/Jockey/JockeySidebar';

/**
 * JockeyPortal — sidebar navigation với state-based routing.
 * Deep links không được hỗ trợ ở đây vì tất cả nằm dưới /jockey/*.
 */
function JockeyPortal() {
  const [page, setPage] = React.useState('overview');

  return (
    <div style={{ background: '#131315', minHeight: '100vh', display: 'flex' }}>
      <JockeySidebar active={page} setPage={setPage} />
      {page === 'overview'    && <JockeyOverview />}
      {page === 'schedule'    && <JockeySchedule />}
      {page === 'invitations' && <JockeyInvitations />}
      {page === 'performance' && <JockeyPerformance />}
      {page === 'live'        && <JockeyLive />}
    </div>
  );
}

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Navbar />
          <main>
            <Routes>
              {/* ── Public ─────────────────────────────────────────────── */}
              <Route path="/"                element={<Home />} />
              <Route path="/login"           element={<Login />} />
              <Route path="/register"        element={<Register />} />
              <Route path="/unauthorized"    element={<Unauthorized />} />
              <Route path="/tournaments"     element={<Tournaments />} />
              <Route path="/tournaments/:id" element={<TournamentDetail />} />
              <Route path="/races/:id"       element={<RaceDetail />} />
              <Route path="/predictions"     element={<Predictions />} />

              {/* ── Admin (chỉ role admin) ──────────────────────────────── */}
              <Route path="/dashboard" element={
                <PrivateRoute roles={['admin']}>
                  <AdminPanel />
                </PrivateRoute>
              } />
              <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

              {/* ── Horse Owner ─────────────────────────────────────────── */}
              <Route path="/horse-owner/dashboard" element={
                <PrivateRoute roles={['horse_owner']}>
                  <HorseOwnerDashboard />
                </PrivateRoute>
              } />
              <Route path="/horse-owner/horses" element={
                <PrivateRoute roles={['horse_owner']}>
                  <MyHorses />
                </PrivateRoute>
              } />
              <Route path="/horse-owner/jockeys" element={
                <PrivateRoute roles={['horse_owner']}>
                  <MyJockeys />
                </PrivateRoute>
              } />
              <Route path="/horse-owner/race-registrations" element={
                <PrivateRoute roles={['horse_owner']}>
                  <RaceRegistrations />
                </PrivateRoute>
              } />
              <Route path="/horse-owner/tournaments-races" element={
                <PrivateRoute roles={['horse_owner']}>
                  <TournamentsRaces />
                </PrivateRoute>
              } />
              <Route path="/horse-owner/results-rewards" element={
                <PrivateRoute roles={['horse_owner']}>
                  <ResultsRewards />
                </PrivateRoute>
              } />
              <Route path="/horse-owner/settings" element={
                <PrivateRoute roles={['horse_owner']}>
                  <AccountSettings />
                </PrivateRoute>
              } />

              {/* ── Jockey ─────────────────────────────────────────────── */}
              <Route path="/jockey/*" element={
                <PrivateRoute roles={['jockey']}>
                  <JockeyPortal />
                </PrivateRoute>
              } />

              {/* ── Referee (referee + race_referee) ────────────────────── */}
              <Route path="/referee/dashboard" element={
                <PrivateRoute roles={['referee', 'race_referee']}>
                  <RefereeDashboard />
                </PrivateRoute>
              } />
              <Route path="/referee/races" element={
                <PrivateRoute roles={['referee', 'race_referee']}>
                  <RefereeRaces />
                </PrivateRoute>
              } />
              <Route path="/referee/violations" element={
                <PrivateRoute roles={['referee', 'race_referee']}>
                  <RefereeViolations />
                </PrivateRoute>
              } />
              <Route path="/referee/schedule" element={
                <PrivateRoute roles={['referee', 'race_referee']}>
                  <RefereeSchedule />
                </PrivateRoute>
              } />
              <Route path="/referee/races/:raceId/results" element={
                <PrivateRoute roles={['referee', 'race_referee']}>
                  <RefereeResultEntry />
                </PrivateRoute>
              } />
              <Route path="/referee/races/:raceId/monitor" element={
                <PrivateRoute roles={['referee', 'race_referee']}>
                  <RefereeMonitor />
                </PrivateRoute>
              } />
              <Route path="/referee/history" element={
                <PrivateRoute roles={['referee', 'race_referee']}>
                  <RefereeHistory />
                </PrivateRoute>
              } />

              {/* ── Fallback ────────────────────────────────────────────── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;
