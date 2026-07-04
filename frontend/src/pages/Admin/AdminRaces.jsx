import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminRaces = () => {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRaces();
  }, []);

  const fetchRaces = async () => {
    try {
      setLoading(true);
      setError(null);
      // Try to fetch races from admin API, fallback to public if not ready
      const response = await api.get('/races').catch(() => api.get('/public/races'));
      setRaces(response.data?.data ?? []);
    } catch (err) {
      setError('Không thể tải danh sách cuộc đua.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Đã hoàn thành';
      case 'active':
      case 'ongoing': return 'Đang diễn ra';
      case 'scheduled': return 'Đã lên lịch';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý cuộc đua</h2>
          <p className="text-slate-500 text-xs mt-1">Lên lịch, phân công trọng tài và cấu hình các làn chạy.</p>
        </div>
        <button 
          onClick={() => alert('Chức năng tạo cuộc đua đang được cập nhật.')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          + Tạo cuộc đua mới
        </button>
      </div>

      {loading && (
        <div className="text-center py-10 text-slate-500 text-sm">Đang tải danh sách cuộc đua...</div>
      )}

      {!loading && error && (
        <div className="text-center py-10 text-rose-500 text-sm">{error}</div>
      )}

      {!loading && !error && races.length === 0 && (
        <div className="text-center py-10 text-slate-400 text-sm">Chưa có cuộc đua nào được tạo.</div>
      )}

      {!loading && !error && races.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-3">Tên cuộc đua</th>
                <th className="px-4 py-3">Giải đấu</th>
                <th className="px-4 py-3">Khoảng cách</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {races.map((race) => (
                <tr key={race.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-4 font-semibold text-slate-800">{race.name}</td>
                  <td className="px-4 py-4 text-slate-500">{race.tournament?.name || 'Không xác định'}</td>
                  <td className="px-4 py-4">{race.distance}m</td>
                  <td className="px-4 py-4">{new Date(race.race_time).toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      race.status === 'completed' 
                        ? 'bg-green-150 text-green-700' 
                        : (race.status === 'active' || race.status === 'ongoing')
                        ? 'bg-amber-100 text-amber-700 animate-pulse'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {getStatusLabel(race.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRaces;
