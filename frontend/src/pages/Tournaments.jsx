import React from 'react';
import { Link } from 'react-router-dom';

const Tournaments = () => {
  // Dữ liệu giả lập danh sách giải đấu
  const tournaments = [
    {
      id: 1,
      name: "Grand Royal Derby 2026",
      location: "Sân vận động Phú Thọ, TP.HCM",
      date_range: "15/06 - 20/06/2026",
      category: "World Series",
      status: "Sắp diễn ra",
      prize_pool: "$50,000",
      image: "https://images.unsplash.com/photo-1598974357851-cb814e9960bb?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      name: "Summer Sprint Cup",
      location: "Trường đua Đại Nam, Bình Dương",
      date_range: "01/07 - 05/07/2026",
      category: "Regional",
      status: "Đang mở đăng ký",
      prize_pool: "$20,000",
      image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      name: "Golden Hoof Championship",
      location: "Hà Nội Hippodrome",
      date_range: "12/08 - 15/08/2026",
      category: "National",
      status: "Đang chờ",
      prize_pool: "$35,000",
      image: "https://images.unsplash.com/photo-1534445867742-43195f401b6c?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 4,
      name: "Autumn Classic",
      location: "Trường đua Đà Lạt",
      date_range: "20/09 - 25/09/2026",
      category: "Classic",
      status: "Đang chờ",
      prize_pool: "$15,000",
      image: "https://images.unsplash.com/photo-1599435482199-0b572857ca2f?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Tất cả Giải đấu</h1>
        <p className="text-lg text-slate-600">Khám phá và theo dõi các giải đấu đua ngựa kịch tính trên toàn quốc.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
        {tournaments.map((tournament) => (
          <Link 
            key={tournament.id} 
            to={`/tournaments/${tournament.id}`}
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden flex flex-col md:flex-row h-full"
          >
            <div className="md:w-2/5 relative h-48 md:h-auto overflow-hidden">
              <img 
                src={tournament.image} 
                alt={tournament.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent md:hidden"></div>
            </div>

            <div className="p-8 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {tournament.category}
                </span>
                <span className={`text-[10px] font-bold uppercase ${
                  tournament.status === 'Sắp diễn ra' ? 'text-green-600' : 'text-slate-400'
                }`}>
                  {tournament.status}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                {tournament.name}
              </h3>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center text-sm text-slate-500">
                  <svg className="h-5 w-5 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {tournament.location}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <svg className="h-5 w-5 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {tournament.date_range}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Giải thưởng</p>
                  <p className="text-xl font-black text-indigo-600">{tournament.prize_pool}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200 group-hover:shadow-indigo-200">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Tournaments;
