import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  [
    'rounded-full px-4 py-2 text-sm font-medium transition',
    isActive ? 'bg-slate-900 text-white shadow-glow' : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
  ].join(' ');

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/70 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 font-semibold text-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-glow">
            HR
          </span>
          <span className="hidden sm:block">
            Horse Racing
            <span className="block text-sm font-normal text-slate-500">Tournament System</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={linkClass} end>
            Trang chủ
          </NavLink>
          <NavLink to="/tournaments" className={linkClass}>
            Giải đấu
          </NavLink>
          <NavLink to="/predictions" className={linkClass}>
            Dự đoán
          </NavLink>
          {user && (
            <>
              {user.role === 'horse_owner' && (
                <NavLink to="/horse-owner/dashboard" className={linkClass}>
                  Chủ ngựa
                </NavLink>
              )}
              {user.role === 'referee' && (
                <NavLink to="/referee/dashboard" className={linkClass}>
                  Trọng tài
                </NavLink>
              )}
            </>
          )}
        </nav>

        {/* Search & User Menu */}
        <div className="flex items-center space-x-4">
          {/* Search (Desktop) */}
          <div className="hidden lg:block relative text-gray-400 focus-within:text-gray-600">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0a7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50/50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-slate-90 focus:border-slate-90 sm:text-sm transition-all"
            />
          </div>

          {/* User Menu */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white/80 hover:text-slate-90 transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <NavLink to="/login" className={linkClass}>
              <div className="flex items-center gap-2">
                <span className="hidden lg:inline">Đăng nhập</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
            </NavLink>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-slate-900 hover:bg-white/80 focus:outline-none"
          >
            <svg className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200`}>
        <div className="px-4 pt-2 pb-3 space-y-1">
          <NavLink to="/" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
            Trang chủ
          </NavLink>
          <NavLink to="/tournaments" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
            Giải đấu
          </NavLink>
          <NavLink to="/predictions" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
            Dự đoán
          </NavLink>
          {user && (
            <>
              {user.role === 'horse_owner' && (
                <NavLink to="/horse-owner/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                  Chủ ngựa
                </NavLink>
              )}
              {user.role === 'referee' && (
                <NavLink to="/referee/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                  Trọng tài
                </NavLink>
              )}
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                Đăng xuất
              </button>
            </>
          )}
          {!user && (
            <NavLink to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
              Đăng nhập
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
