import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import HorseOwnerLayout from '../../components/HorseOwner/HorseOwnerLayout';
import AddNewHorseModal from '../../components/HorseOwner/AddNewHorseModal';

const StatCard = ({ label, value, color, prefix = '', loading }) => (
  <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${color}`}>
    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
    <p className="text-3xl font-bold text-gray-800">
      {loading ? <span className="text-gray-300">—</span> : <>{prefix}{value}</>}
    </p>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ horses: 0, jockeys: 0, upcoming: 0, winnings: 0 });
  const [activity, setActivity] = useState([]);

  const fetchStats = () => {
    const ownerId = user?.id;
    Promise.all([
      api.get(`/owners/${ownerId}/horses/count`).catch(() => ({ data: { count: 0 } })),
      api.get(`/owners/${ownerId}/horses`).catch(() => ({ data: { data: [] } })),
    ]).then(([countRes, horsesRes]) => {
      const horses = countRes.data?.count ?? 0;
      const horseList = horsesRes.data?.data ?? horsesRes.data ?? [];

      // Build activity từ danh sách ngựa
      const acts = horseList.slice(0, 5).map(h => ({
        id: h.id,
        text: `Ngựa "${h.name}" — ${h.breed ?? 'chưa xác định giống'} · ${h.age ?? '?'} tuổi`,
        date: h.created_at ? new Date(h.created_at).toLocaleDateString('vi-VN') : '—',
        icon: '🐴',
      }));

      setStats(s => ({ ...s, horses }));
      setActivity(acts);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchStats(); }, [user]);

  const quickActions = [
    { label: 'Thêm ngựa mới',       color: 'bg-blue-500 hover:bg-blue-600',   action: () => setIsModalOpen(true) },
    { label: 'Đăng ký cuộc đua',    color: 'bg-green-500 hover:bg-green-600', action: () => navigate('/horse-owner/race-registrations') },
    { label: 'Thuê nài ngựa',       color: 'bg-purple-500 hover:bg-purple-600',action: () => navigate('/horse-owner/jockeys') },
    { label: 'Xem kết quả & thưởng',color: 'bg-amber-500 hover:bg-amber-600', action: () => navigate('/horse-owner/results-rewards') },
  ];

  return (
    <HorseOwnerLayout>
      <div className="max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Bảng điều khiển</h1>
        <p className="text-gray-500 mb-8">Xin chào, <strong>{user?.name}</strong>! Đây là tổng quan tài khoản của bạn.</p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard label="Tổng số ngựa"   value={stats.horses}   color="border-blue-500"   loading={loading} />
          <StatCard label="Nài ngựa đang làm việc" value={stats.jockeys}   color="border-green-500"  loading={loading} />
          <StatCard label="Cuộc đua sắp tới" value={stats.upcoming} color="border-purple-500" loading={loading} />
          <StatCard label="Tổng tiền thưởng" value={(stats.winnings).toLocaleString('vi-VN')} prefix="₫" color="border-amber-500" loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5">Hoạt động gần đây</h2>
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : activity.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-3xl mb-2">🐎</p>
                <p className="text-sm">Chưa có hoạt động nào. Hãy thêm ngựa đầu tiên!</p>
              </div>
            ) : (
              <div className="space-y-0">
                {activity.map((act, i) => (
                  <div key={act.id} className={`flex items-start gap-3 py-4 ${i < activity.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <span className="text-xl mt-0.5">{act.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-medium text-sm truncate">{act.text}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{act.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5">Thao tác nhanh</h2>
            <div className="space-y-3">
              {quickActions.map(a => (
                <button
                  key={a.label}
                  onClick={a.action}
                  className={`w-full ${a.color} text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Điều hướng nhanh</h3>
              <div className="space-y-1">
                {[
                  { label: '🐴 Ngựa của tôi',       path: '/horse-owner/horses' },
                  { label: '🏆 Giải đấu & Đua',     path: '/horse-owner/tournaments-races' },
                  { label: '⚙️ Cài đặt tài khoản',  path: '/horse-owner/settings' },
                ].map(link => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddNewHorseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchStats();
        }}
      />
    </HorseOwnerLayout>
  );
};

export default Dashboard;
