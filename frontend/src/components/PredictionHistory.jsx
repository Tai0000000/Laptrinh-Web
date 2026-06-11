import React from 'react';

const PredictionHistory = ({ predictions }) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-8">
      <div className="bg-slate-900 px-8 py-5">
        <h3 className="text-white font-bold text-lg">Lịch sử dự đoán của tôi</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-8 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">Cuộc đua</th>
              <th className="px-8 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">Chiến mã</th>
              <th className="px-8 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">Dự đoán</th>
              <th className="px-8 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">Kết quả</th>
              <th className="px-8 py-4 text-right text-xs font-black uppercase tracking-widest text-slate-500">Tiền thưởng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {predictions.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-12 text-center text-slate-400 italic">
                  Bạn chưa thực hiện dự đoán nào.
                </td>
              </tr>
            ) : (
              predictions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{p.race_name}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{p.tournament_name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold mr-3 text-slate-700">
                        {p.lane}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{p.horse_name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-tighter">
                      {p.prediction_type === 'win' ? 'Thắng' : p.prediction_type === 'place' ? 'Top 2' : 'Top 3'}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                      p.status === 'won' ? 'bg-green-100 text-green-700' : 
                      p.status === 'lost' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.status === 'won' ? 'Thắng' : p.status === 'lost' ? 'Thua' : 'Đang chờ'}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <span className={`text-sm font-black ${p.status === 'won' ? 'text-green-600' : 'text-slate-400'}`}>
                      {p.status === 'won' ? `+$${p.payout}` : p.status === 'lost' ? '-$0' : '--'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PredictionHistory;
