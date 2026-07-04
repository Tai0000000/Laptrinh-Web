import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role?.value ?? user?.role;

  const goHome = () => {
    switch (role) {
      case 'admin':        navigate('/dashboard');             break;
      case 'horse_owner':  navigate('/horse-owner/dashboard'); break;
      case 'referee':
      case 'race_referee': navigate('/referee/dashboard');     break;
      case 'jockey':       navigate('/jockey');                break;
      default:             navigate('/');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)',
      padding: 24,
    }}>
      <div style={{
        maxWidth: 480, width: '100%', textAlign: 'center',
        background: 'white', borderRadius: 24, padding: '48px 40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.8)',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
        }}>
          <span style={{ fontSize: 36 }}>🔒</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
          Không có quyền truy cập
        </h1>
        <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          Tài khoản của bạn không có quyền truy cập vào trang này.
          {role && (
            <> Vai trò hiện tại: <strong style={{ color: '#6366f1' }}>{role}</strong>.</>
          )}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={goHome}
            style={{
              padding: '12px 28px', background: '#1e293b', color: 'white',
              border: 'none', borderRadius: 50, fontWeight: 700, fontSize: 14,
              cursor: 'pointer', transition: 'background 0.2s',
            }}
          >
            Về trang của tôi
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{
              padding: '12px 28px', background: 'transparent', color: '#64748b',
              border: '1px solid #e2e8f0', borderRadius: 50, fontWeight: 600,
              fontSize: 14, cursor: 'pointer',
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
