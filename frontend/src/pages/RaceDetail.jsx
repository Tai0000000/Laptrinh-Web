import React from 'react';
import { useParams, Link } from 'react-router-dom';

const RaceDetail = () => {
  const { id } = useParams();

  // Dữ liệu giả lập chi tiết cuộc đua
  const race = {
    id: id,
    name: "Vòng loại Bảng A - Sprint",
    time: "14:30 - 15/06/2026",
    distance: 1200,
    tournament_name: "Grand Royal Derby 2026",
    participants: [
      { lane: 1, horse: "Thần Gió", jockey: "Nguyễn Văn An", breed: "Thoroughbred", weight: "54kg", color: "Nâu đậm" },
      { lane: 2, horse: "Xích Thố", jockey: "Lê Minh Tâm", breed: "Arabian", weight: "52kg", color: "Đỏ hồng" },
      { lane: 3, horse: "Bạch Mã", jockey: "Trần Hữu Phước", breed: "Quarter Horse", weight: "55kg", color: "Trắng" },
      { lane: 4, horse: "Hắc Long", jockey: "Phạm Quốc Bảo", breed: "Appaloosa", weight: "53kg", color: "Đen" },
      { lane: 5, horse: "Tia Chớp", jockey: "Hoàng Gia Huy", breed: "Paint Horse", weight: "54kg", color: "Đốm trắng" },
      { lane: 6, horse: "Đại Bàng", jockey: "Vũ Tiến Đạt", breed: "Morgan", weight: "52kg", color: "Xám" }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <Link to={`/tournaments/1`} className="text-indigo-600 font-bold flex items-center mb-6 hover:underline">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại danh sách cuộc đua
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-indigo-500 font-bold text-sm uppercase tracking-widest">{race.tournament_name}</span>
            <h1 className="text-4xl font-black text-slate-900 mt-2">{race.name}</h1>
            <p className="text-slate-500 mt-2 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {race.time} • {race.distance}m
            </p>
          </div>
          <Link to="/predictions" className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-all text-center">
            Đặt cược ngay
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-widest">Làn</th>
                <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-widest">Chiến mã</th>
                <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-widest">Nài ngựa</th>
                <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-widest hidden md:table-cell">Giống ngựa</th>
                <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-widest hidden lg:table-cell">Cân nặng</th>
                <th className="px-8 py-5 text-right text-xs font-black uppercase tracking-widest">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {race.participants.map((p) => (
                <tr key={p.lane} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {p.lane}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 shadow-sm`} style={{ backgroundColor: p.color === 'Trắng' ? '#f8fafc' : (p.color === 'Đen' ? '#0f172a' : (p.color === 'Nâu đậm' ? '#451a03' : '#dc2626')) }}></div>
                      <span className="text-base font-bold text-slate-900">{p.horse}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-600">{p.jockey}</span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap hidden md:table-cell text-sm text-slate-500 italic">
                    {p.breed}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap hidden lg:table-cell text-sm text-slate-500">
                    {p.weight}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <button className="text-indigo-600 font-bold text-xs hover:text-indigo-800 uppercase tracking-tighter">Xem thành tích</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
          <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
            <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Thông tin trường đua
          </h3>
          <p className="text-indigo-700/80 leading-relaxed text-sm">
            Mặt sân cỏ tự nhiên, độ ẩm 15%. Điều kiện thời tiết lý tưởng cho các dòng ngựa Thoroughbred. 
            Dự kiến tốc độ trung bình đạt 65km/h.
          </p>
        </div>
        <div className="bg-slate-900 p-8 rounded-3xl text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <svg className="h-6 w-6 mr-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Quy tắc cuộc đua
          </h3>
          <ul className="space-y-2 text-sm text-slate-400 list-disc pl-5">
            <li>Nài ngựa phải mặc đúng trang phục bảo hộ của ban tổ chức.</li>
            <li>Ngựa vi phạm làn đua quá 3 lần sẽ bị loại trực tiếp.</li>
            <li>Kết quả cuối cùng dựa trên camera vạch đích (Photo Finish).</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RaceDetail;
