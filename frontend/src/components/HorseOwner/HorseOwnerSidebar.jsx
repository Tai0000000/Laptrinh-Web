import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const HorseOwnerSidebar = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { label: 'Dashboard',           path: '/horse-owner/dashboard' },
    { label: 'My Horses',           path: '/horse-owner/horses' },
    { label: 'My Jockeys',          path: '/horse-owner/jockeys' },
    { label: 'Race Registrations',  path: '/horse-owner/race-registrations' },
    { label: 'Tournaments & Races', path: '/horse-owner/tournaments-races' },
    { label: 'Results & Rewards',   path: '/horse-owner/results-rewards' },
    { label: 'Account Settings',    path: '/horse-owner/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white min-h-screen p-4 shadow-lg flex flex-col">
      {/* Logo/Title */}
      <div className="mb-8 pb-4 border-b border-blue-400">
        <h1 className="text-2xl font-bold">Horse Owner</h1>
        <p className="text-blue-100 text-sm mt-1">Dashboard</p>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2 flex-1">
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

      {/* User info + Logout */}
      <div className="pt-4 border-t border-blue-400 mt-4 space-y-3">
        {user && (
          <div className="px-4 py-2">
            <p className="text-xs text-blue-200 uppercase tracking-wider">Đăng nhập với</p>
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-red-500 hover:text-white transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default HorseOwnerSidebar;
