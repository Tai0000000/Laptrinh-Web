import React from 'react';
import { useParams, Link } from 'react-router-dom';

const TournamentDetail = () => {
  const { id } = useParams();

  // Dữ liệu giả lập chi tiết giải đấu và các cuộc đua
  const tournament = {
    id: id,
    name: "Grand Royal Derby 2026",
    description: "Giải đấu đua ngựa lớn nhất năm với sự tham gia của các nài ngựa hàng đầu thế giới.",
    location: "Sân vận động Phú Thọ, TP.HCM",
    races: [
      {
        id: 101,
        name: "Vòng loại Bảng A - Sprint",
        time: "14:30 - 15/06/2026",
        distance: 1200,
        status: "Sắp bắt đầu",
        horses_count: 8
      },
      {
        id: 102,
        name: "Vòng loại Bảng B - Long Distance",
        time: "16:00 - 15/06/2026",
        distance: 2400,
        status: "Đang chờ",
        horses_count: 10
      },
      {
        id: 103,
        name: "Bán kết 1",
        time: "14:30 - 17/06/2026",
        distance: 1600,
        status: "Đang chờ",
        horses_count: 6
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link to="/tournaments" className="text-indigo-600 font-bold flex items-center mb-6 hover:underline">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại danh sách giải đấu
        </Link>
        <h1 className="text-4xl font-black text-slate-900 mb-4">{tournament.name}</h1>
        <p className="text-lg text-slate-600 max-w-3xl">{tournament.description}</p>
      </div>

      <div className="grid gap-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Danh sách các cuộc đua</h2>
        {tournament.races.map((race) => (
          <Link 
            key={race.id} 
            to={`/races/${race.id}`}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between group"
          >
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mr-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{race.name}</h3>
                <p className="text-sm text-slate-500">{race.time}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-8 items-center">
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Khoảng cách</p>
                <p className="text-sm font-black text-slate-700">{race.distance}m</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Chiến mã</p>
                <p className="text-sm font-black text-slate-700">{race.horses_count} con</p>
              </div>
              <div className="text-center min-w-[100px]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                  race.status === 'Sắp bắt đầu' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {race.status}
                </span>
              </div>
              <div className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-indigo-600 group-hover:text-indigo-600 transition-all">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TournamentDetail;
