import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import RaceDetail from './pages/RaceDetail';
import Navbar from './components/Navbar';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';

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
import RefereeResultEntry from './pages/Referee/ResultEntry';

// Jockey Pages
import JockeyOverview from './pages/jockey/JockeyOverview';
import JockeyInvitations from './pages/jockey/JockeyInvitations';
import JockeySchedule from './pages/jockey/JockeySchedule';
import JockeyPerformance from './pages/jockey/JockeyPerformance';
import JockeySidebar from './components/Jockey/JockeySidebar';

function JockeyPortal() {
  const [page, setPage] = React.useState('overview');
  return (
<<<<<<< Updated upstream
    <div style={{ background: '#131315', minHeight: '100vh', display: 'flex' }}>
      <JockeySidebar active={page} setPage={setPage} />
      {page === 'overview'     && <JockeyOverview />}
      {page === 'schedule'     && <JockeySchedule />}
      {page === 'invitations'  && <JockeyInvitations />}
      {page === 'performance'  && <JockeyPerformance />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            
            <Route path="/jockey/*" element={<JockeyPortal />} />

            <Route path="*" element={
              <div className="min-h-screen bg-transparent">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/tournaments" element={<Tournaments />} />
                    <Route path="/tournaments/:id" element={<TournamentDetail />} />
                    <Route path="/races/:id" element={<RaceDetail />} />

                    {/* Horse Owner */}
                    <Route path="/blank" element={<Blank />} />
                    <Route path="/horse-owner/dashboard" element={<Dashboard />} />
                    <Route path="/horse-owner/horses" element={<MyHorses />} />
                    <Route path="/horse-owner/jockeys" element={<MyJockeys />} />
                    <Route path="/horse-owner/race-registrations" element={<RaceRegistrations />} />
                    <Route path="/horse-owner/tournaments-races" element={<TournamentsRaces />} />
                    <Route path="/horse-owner/results-rewards" element={<ResultsRewards />} />
                    <Route path="/horse-owner/settings" element={<AccountSettings />} />

                    {/* Referee */}
                    <Route path="/referee/dashboard" element={<RefereeDashboard />} />
                    <Route path="/referee/races" element={<RefereeRaces />} />
                    <Route path="/referee/violations" element={<RefereeViolations />} />
                    <Route path="/referee/schedule" element={<RefereeSchedule />} />
                  </Routes>
                </main>
              </div>
            } />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

=======
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
              <Route path="/referee/races/:raceId/results" element={<RefereeResultEntry />} />
              <Route path="/referee/violations" element={<RefereeViolations />} />
              <Route path="/referee/schedule" element={<RefereeSchedule />} />

            </Routes>
          </main>
        </div>
      </Router>
    </SocketProvider>
  );
}

>>>>>>> Stashed changes
export default App;
