import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const HorseOwnerSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/horse-owner/dashboard' },
    { label: 'My Horses', path: '/horse-owner/horses' },
    { label: 'My Jockeys', path: '/horse-owner/jockeys' },
    { label: 'Race Registrations', path: '/horse-owner/race-registrations' },
    { label: 'Tournaments & Races', path: '/horse-owner/tournaments-races' },
    { label: 'Results & Rewards', path: '/horse-owner/results-rewards' },
    { label: 'Account Settings', path: '/horse-owner/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white min-h-screen p-4 shadow-lg">
      {/* Logo/Title */}
      <div className="mb-8 pb-4 border-b border-blue-400">
        <h1 className="text-2xl font-bold">Horse Owner</h1>
        <p className="text-blue-100 text-sm mt-1">Dashboard</p>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-white text-blue-600 font-semibold shadow-md'
                : 'text-blue-50 hover:bg-blue-500 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
    </div>
  );
};

export default HorseOwnerSidebar;
