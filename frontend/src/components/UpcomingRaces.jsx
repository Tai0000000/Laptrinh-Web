import React from 'react';
import { Link } from 'react-router-dom';

const UpcomingRaces = ({ races }) => {
  return (
    <section className="py-12 bg-slate-50/50 rounded-3xl px-8 border border-gray-100">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Lịch đua sắp tới</h2>
          <p className="text-slate-500 mt-2 text-lg">Theo dõi các cuộc đua kịch tính trong ngày hôm nay.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white rounded-full text-sm font-bold shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">Hôm nay</button>
          <button className="px-4 py-2 text-slate-500 text-sm font-bold hover:text-slate-900 transition-colors">Ngày mai</button>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Thời gian</th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Tên cuộc đua</th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest hidden md:table-cell">Giải đấu</th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest hidden lg:table-cell">Khoảng cách</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {races.map((race) => (
              <tr key={race.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900">{race.time}</span>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase">{race.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-3 group-hover:scale-150 transition-transform"></div>
                    <span className="text-sm font-bold text-slate-900">{race.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-sm text-slate-500">{race.tournament_name}</span>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="text-sm font-mono text-slate-500">{race.distance}m</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    to={`/races/${race.id}`} 
                    className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    CHI TIẾT
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-center">
        <button className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
          Tải thêm lịch đua &darr;
        </button>
      </div>
    </section>
  );
};

export default UpcomingRaces;
