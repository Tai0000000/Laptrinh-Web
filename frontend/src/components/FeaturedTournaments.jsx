import React from 'react';
import { Link } from 'react-router-dom';

const FeaturedTournaments = ({ tournaments }) => {
  return (
    <section className="py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Giải đấu nổi bật</h2>
          <p className="text-slate-500 mt-2 text-lg">Khám phá các sự kiện đua ngựa đẳng cấp nhất.</p>
        </div>
        <Link to="/tournaments" className="text-indigo-600 font-bold hover:underline flex items-center group">
          Xem tất cả <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tournaments.map((tournament) => (
          <div key={tournament.id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col">
            <div className="relative h-48 bg-slate-200">
              {/* Placeholder for image */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
              <div className="absolute bottom-4 left-6">
                <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-2 inline-block shadow-lg">
                  {tournament.category || 'Professional'}
                </span>
                <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-slate-500">
                  <svg className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {tournament.location}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <svg className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {tournament.date_range}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <svg className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {tournament.race_count} Cuộc đua • {tournament.horse_count} Chiến mã
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Giải thưởng tới: <span className="text-indigo-600">{tournament.prize_pool}</span></span>
                <Link to={`/tournaments/${tournament.id}`} className="p-2 rounded-full bg-slate-50 text-slate-900 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedTournaments;
