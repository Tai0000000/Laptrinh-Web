import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  [
    'rounded-full px-4 py-2 text-sm font-medium transition',
    isActive ? 'bg-slate-900 text-white shadow-glow' : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
  ].join(' ');

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hide global navbar for admin portal (role có thể là string hoặc enum object)
  const role = user?.role?.value ?? user?.role;
  if (location.pathname === '/dashboard' && role === 'admin') {
    return null;
  }


  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3 font-semibold text-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-glow">
            HR
          </span>
          <span>
            Horse Racing
            <span className="block text-sm font-normal text-slate-500">Tournament System</span>
          </span>
        </NavLink>

        <nav className="flex items-center gap-2">
          <NavLink to="/" className={linkClass} end>
            Trang chủ
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <button
                onClick={handleLogout}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900 transition"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Đăng nhập
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;