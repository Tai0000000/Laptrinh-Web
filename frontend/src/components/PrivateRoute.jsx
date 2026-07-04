import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute — bảo vệ route, yêu cầu đăng nhập và đúng role.
 *
 * Props:
 *   - roles: string[] — danh sách role được phép (bỏ trống = chỉ cần đăng nhập)
 *   - children: ReactNode
 *
 * Luồng:
 *   1. Đang verify token → hiển thị loading
 *   2. Chưa đăng nhập → redirect /login (giữ lại intended URL)
 *   3. Sai role → redirect /unauthorized
 *   4. OK → render children
 */
export default function PrivateRoute({ children, roles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Đang verify token với server — chờ kết quả
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0f0f11',
      }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid rgba(99,102,241,0.2)',
          borderTop: '3px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra role (hỗ trợ cả string lẫn enum object)
  if (roles.length > 0) {
    const userRole = user?.role?.value ?? user?.role;
    // referee và race_referee được coi là tương đương
    const normalised = userRole === 'referee' ? 'race_referee' : userRole;
    const allowed = roles.includes(normalised) || roles.includes(userRole);
    if (!allowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}
