import React from 'react';
import RefereeLayout from '../../components/RefereeLayout';

const Dashboard = () => {
  const stats = [
    { label: 'Cuộc đua hôm nay', value: '4', change: '2 đã hoàn thành', type: 'info', color: 'from-amber-500 to-yellow-600' },
    { label: 'Kiểm tra trước đua', value: '1', change: 'Hết hạn sau 30 phút', type: 'warning', color: 'from-orange-500 to-amber-600' },
    { label: 'Vi phạm đã ghi', value: '2', change: 'Cuộc đua số 3 & 4', type: 'error', color: 'from-rose-500 to-red-600' },
    { label: 'Báo cáo hoàn thành', value: '12', change: 'Tuần này', type: 'success', color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <RefereeLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-400 bg-clip-text text-transparent">
              Bảng điều khiển Trọng tài
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base">
              Chào mừng quay trở lại, Trọng tài trưởng <span className="text-amber-400 font-bold">Minh Tâm</span>. Giữ vững tính công bằng và minh bạch.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-2 text-xs font-semibold text-amber-400 self-start md:self-auto shadow-inner backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Phiên hoạt động Trực tiếp</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md hover:border-slate-700/60 transition-all duration-300 group hover:-translate-y-1 shadow-lg"
            >
              <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${stat.color}`}></div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline space-x-2 mt-4">
                <span className="text-3xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300">
                  {stat.value}
                </span>
                <span className="text-slate-500 text-xs font-medium">({stat.change})</span>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Races list */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-md shadow-lg space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white tracking-wide">Lịch trình phân công hôm nay</h2>
              <span className="text-slate-400 text-xs hover:text-amber-400 cursor-pointer transition-colors duration-200">Xem tất cả</span>
            </div>

            <div className="space-y-4">
              {[
                { time: '14:30', name: 'Chung kết Grand Prix', status: 'Đã hoàn thành', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
                { time: '16:00', name: 'Cúp Spring Sprint - Nhóm A', status: 'Đang diễn ra', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' },
                { time: '17:15', name: 'Cúp Spring Sprint - Nhóm B', status: 'Đã lên lịch', color: 'bg-slate-800 text-slate-400 border border-slate-700/50' },
                { time: '19:00', name: 'Sunset Classic Derby', status: 'Đã lên lịch', color: 'bg-slate-800 text-slate-400 border border-slate-700/50' },
              ].map((race, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl hover:bg-slate-900/30 transition-colors duration-300 group">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-bold text-amber-500 bg-amber-500/5 border border-amber-500/20 px-3 py-1 rounded-lg">
                      {race.time}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors duration-200">{race.name}</h4>
                      <p className="text-slate-500 text-xs mt-0.5">Địa điểm: Đường đua A • Khoảng cách: 1200m</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${race.color}`}>
                    {race.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-md shadow-lg space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white tracking-wide">Điều khiển nhanh</h2>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-md shadow-amber-500/15 active:scale-[0.98]">
                  Kiểm tra trước cuộc đua
                </button>
                <button className="w-full bg-slate-800 hover:bg-slate-750 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 border border-slate-700/50 active:scale-[0.98]">
                  Nhập kết quả cuộc đua
                </button>
                <button className="w-full bg-slate-800 hover:bg-slate-750 text-rose-400 hover:text-rose-300 font-bold py-3.5 px-4 rounded-xl transition-all duration-300 border border-slate-700/50 active:scale-[0.98]">
                  Ghi thẻ lỗi vi phạm
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/80 mt-6 lg:mt-0">
              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
                <p className="text-slate-400 text-xs font-semibold">Quy tắc điều hành</p>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Tất cả kết quả phải được xác nhận bởi ít nhất hai trọng tài chính thức trước khi lưu và xuất bản báo cáo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RefereeLayout>
  );
};

export default Dashboard;
