import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
    <Router>
      <Routes>
        <Route path="/" element={<Blank />} />
        
        {/* Horse Owner Dashboard Routes */}
        <Route path="/horse-owner/dashboard" element={<Dashboard />} />
        <Route path="/horse-owner/horses" element={<MyHorses />} />
        <Route path="/horse-owner/horses/new" element={<AddNewHorse />} />
        <Route path="/horse-owner/jockeys" element={<MyJockeys />} />
        <Route path="/horse-owner/race-registrations" element={<RaceRegistrations />} />
        <Route path="/horse-owner/tournaments-races" element={<TournamentsRaces />} />
        <Route path="/horse-owner/results-rewards" element={<ResultsRewards />} />
        <Route path="/horse-owner/settings" element={<AccountSettings />} />
      </Routes>
    </Router>
  );
}

export default App;
