import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import RaceDetail from './pages/RaceDetail';
import Navbar from './components/Navbar';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="min-h-screen bg-transparent">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/tournaments/:id" element={<TournamentDetail />} />
              <Route path="/races/:id" element={<RaceDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Thêm các tuyến đường cho các vai trò cụ thể tại đây */}
            </Routes>
          </main>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;
