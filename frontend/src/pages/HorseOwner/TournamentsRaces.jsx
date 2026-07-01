import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import HorseOwnerLayout from '../../components/HorseOwner/HorseOwnerLayout';

const STATUS_CFG = {
  ongoing:   { label: 'Đang diễn ra', cls: 'bg-green-100 text-green-700' },
  upcoming:  { label: 'Sắp diễn ra',  cls: 'bg-blue-100 text-blue-700' },
  scheduled: { label: 'Đã lên lịch',  cls: 'bg-blue-100 text-blue-700' },
  finished:  { label: 'Đã kết thúc',  cls: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'Đã hủy',       cls: 'bg-red-100 text-red-600' },
};

const TournamentsRaces = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [filter, setFilter]           = useState('all');

  useEffect(() => {
    api.get('/public/tournaments')
      .then(r => setTournaments(r.data?.data ?? r.data ?? []))
      .catch(() => setError('Không thể tải danh sách giải đấu.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? tournaments
    : tournaments.filter(t => t.status === filter);

  return (
    <HorseOwnerLayout>
      <div className="max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Giải đấu & Cuộc đua</h1>
            <p className="text-gray-500 mt-1 text-sm">Xem các giải đấu đang và sắp diễn ra</p>
          </div>
          <button
            onClick={() => navigate('/horse-owner/race-registrations')}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm"
          >
            + Đăng ký tham gia
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[['all','Tất cả'], ['scheduled','Sắp diễn ra'], ['ongoing','Đang diễn ra'], ['finished','Đã kết thúc']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${filter === v ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
              {l}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="h-56 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-center">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🏆</p>
            <p className="text-sm">Không có giải đấu nào trong mục này</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(t => {
              const cfg = STATUS_CFG[t.status] ?? { label: t.status, cls: 'bg-gray-100 text-gray-600' };
              const start = t.start_date ? new Date(t.start_date).toLocaleDateString('vi-VN') : '—';
              const end   = t.end_date   ? new Date(t.end_date).toLocaleDateString('vi-VN')   : '—';
              return (
                <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <h2 className="text-base font-bold text-gray-800 leading-tight">{t.name}</h2>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.cls}`}>{cfg.label}</span>
                    </div>

                    {t.description && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{t.description}</p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bắt đầu</span>
                        <span className="font-medium text-gray-700">{start}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Kết thúc</span>
                        <span className="font-medium text-gray-700">{end}</span>
                      </div>
                      {t.prize_pool != null && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Giải thưởng</span>
                          <span className="font-bold text-green-600">
                            {Number(t.prize_pool).toLocaleString('vi-VN')} ₫
                          </span>
                        </div>
                      )}
                      {t.races_count != null && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Số cuộc đua</span>
                          <span className="font-medium text-gray-700">{t.races_count}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-5">
                    <button
                      onClick={() => navigate(`/tournaments/${t.id}`)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </HorseOwnerLayout>
  );
};

export default TournamentsRaces;
