import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import HorseOwnerLayout from '../../components/HorseOwner/HorseOwnerLayout';
import AddNewHorseModal from '../../components/HorseOwner/AddNewHorseModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Real stats state
  const [totalHorses, setTotalHorses] = useState(0);
  const [activeJockeysCount, setActiveJockeysCount] = useState(0);
  const [upcomingRacesCount, setUpcomingRacesCount] = useState(0);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchDashboardData = async () => {
    setLoadingStats(true);
    try {
      // 1. Get total horses
      const countRes = await api.get(`/owners/${user?.id}/horses/count`);
      setTotalHorses(countRes.data.count ?? 0);

      // 2. Get active jockeys
      const contractsRes = await api.get('/contracts/owner');
      const contracts = contractsRes.data?.data ?? [];
      const activeContracts = contracts.filter(c => c.contractStatus === 'active' || c.contractStatus === 'Active');
      setActiveJockeysCount(activeContracts.length);

      // 3. Get registrations (upcoming/active races)
      const regsRes = await api.get('/registrations/owner');
      const registrations = regsRes.data?.data ?? [];
      setUpcomingRacesCount(registrations.filter(r => r.status === 'confirmed' || r.status === 'pending').length);

      // 4. Get horses list to calculate total winnings and build recent activity
      const horsesRes = await api.get('/horses');
      const horsesList = horsesRes.data ?? [];

      const resultsPromises = horsesList.map(async (horse) => {
        try {
          const res = await api.get(`/horses/${horse.id}/results`);
          return (res.data ?? []).map(r => ({
            ...r,
            horseName: horse.name
          }));
        } catch (e) {
          return [];
        }
      });

      const allResultsNested = await Promise.all(resultsPromises);
      const compiledResults = allResultsNested.flat();

      // Calculate total winnings
      const winnings = compiledResults.reduce((acc, curr) => {
        let amount = 0;
        if (curr.rank === 1) amount = 10000000;
        else if (curr.rank === 2) amount = 5000000;
        else if (curr.rank === 3) amount = 2000000;
        return acc + amount;
      }, 0);
      setTotalWinnings(winnings);

      // Build recent activities based on actual registrations and results
      const activities = [];
      
      // Add results
      compiledResults.slice(0, 3).forEach(r => {
        const prizeStr = r.rank === 1 ? '10M' : r.rank === 2 ? '5M' : r.rank === 3 ? '2M' : '';
        activities.push({
          text: `Ngựa "${r.horseName}" cán đích Hạng ${r.rank} tại chặng đua #${r.race_id} ${prizeStr ? `(Nhận ${prizeStr}đ thưởng)` : ''}`,
          date: r.updated_at ? new Date(r.updated_at).toLocaleDateString('vi-VN') : 'Mới đây'
        });
      });

      // Add registrations
      registrations.slice(0, 3).forEach(reg => {
        activities.push({
          text: `Đăng ký thi đấu cho ngựa "${reg.horse_name}" tại vòng ${reg.race_name} (${reg.status === 'confirmed' ? 'Đã duyệt' : 'Chờ duyệt'})`,
          date: 'Vừa đăng ký'
        });
      });

      setRecentActivities(activities.slice(0, 4));

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchDashboardData();
  };

  return (
    <HorseOwnerLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Trang Tổng Quan</h1>
        <p className="text-slate-500 mb-8">Chào mừng bạn quay trở lại, chủ ngựa {user?.name}.</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tổng số ngựa</p>
              <p className="text-3xl font-black text-slate-950 mt-1">
                {loadingStats ? '...' : totalHorses}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Jockey hợp đồng</p>
              <p className="text-3xl font-black text-slate-950 mt-1">
                {loadingStats ? '...' : activeJockeysCount}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Đăng ký tham gia</p>
              <p className="text-3xl font-black text-slate-950 mt-1">
                {loadingStats ? '...' : upcomingRacesCount}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tiền thưởng tích lũy</p>
              <p className="text-2xl font-black text-emerald-600 mt-1.5">
                {loadingStats ? '...' : `${totalWinnings.toLocaleString('vi-VN')}đ`}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6">Hoạt Động Gần Đây</h2>
            <div className="space-y-4">
              {loadingStats ? (
                <p className="text-slate-400 text-sm">Đang tải lịch sử hoạt động...</p>
              ) : recentActivities.length === 0 ? (
                <p className="text-slate-400 text-sm italic">Chưa ghi nhận hoạt động nào gần đây.</p>
              ) : (
                recentActivities.map((act, idx) => (
                  <div key={idx} className="pb-4 border-b border-slate-50 last:border-0 last:pb-0 flex justify-between items-start gap-4">
                    <p className="text-slate-800 text-sm font-semibold leading-relaxed">{act.text}</p>
                    <span className="text-slate-400 text-xs whitespace-nowrap">{act.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6">Thao Tác Nhanh</h2>
            <div className="space-y-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-2xl transition shadow-md active:scale-95 text-sm"
              >
                Thêm ngựa mới
              </button>
              
              <Link 
                to="/horse-owner/tournaments-races"
                className="w-full block bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-2xl text-center transition shadow-md shadow-indigo-600/10 active:scale-95 text-sm"
              >
                Đăng ký giải đấu mới
              </Link>
              
              <Link 
                to="/horse-owner/jockeys"
                className="w-full block bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-2xl text-center transition shadow-md shadow-emerald-600/10 active:scale-95 text-sm"
              >
                Tìm & ký hợp đồng Jockey
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Horse Modal */}
      <AddNewHorseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess} 
      />
    </HorseOwnerLayout>
  );
};

export default Dashboard;
