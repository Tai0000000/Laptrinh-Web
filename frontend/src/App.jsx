import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import RaceDetail from './pages/RaceDetail';
import Navbar from './components/Navbar';
import { SocketProvider } from './context/SocketContext';

// Horse Owner Pages
import Blank from './pages/Blank';
import Dashboard from './pages/HorseOwner/Dashboard';
import MyHorses from './pages/HorseOwner/MyHorses';
import AddNewHorse from './pages/HorseOwner/AddNewHorse';
import MyJockeys from './pages/HorseOwner/MyJockeys';
import RaceRegistrations from './pages/HorseOwner/RaceRegistrations';
import TournamentsRaces from './pages/HorseOwner/TournamentsRaces';
import ResultsRewards from './pages/HorseOwner/ResultsRewards';
import AccountSettings from './pages/HorseOwner/AccountSettings';

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
              
              {/* Horse Owner Dashboard Routes */}
              <Route path="/blank" element={<Blank />} /> 
              <Route path="/horse-owner/dashboard" element={<Dashboard />} />
              <Route path="/horse-owner/horses" element={<MyHorses />} />
              <Route path="/horse-owner/horses/new" element={<AddNewHorse />} />
              <Route path="/horse-owner/jockeys" element={<MyJockeys />} />
              <Route path="/horse-owner/race-registrations" element={<RaceRegistrations />} />
              <Route path="/horse-owner/tournaments-races" element={<TournamentsRaces />} />
              <Route path="/horse-owner/results-rewards" element={<ResultsRewards />} />
              <Route path="/horse-owner/settings" element={<AccountSettings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;