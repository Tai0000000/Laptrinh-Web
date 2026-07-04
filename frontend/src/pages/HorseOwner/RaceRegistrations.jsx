import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import HorseOwnerLayout from '../../components/HorseOwner/HorseOwnerLayout';

const STATUS_MAP = {
  confirmed: { label: 'Đã xác nhận', cls: 'bg-green-100 text-green-700' },
  pending:   { label: 'Chờ duyệt',   cls: 'bg-yellow-100 text-yellow-700' },
  rejected:  { label: 'Từ chối',     cls: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Đã hủy',      cls: 'bg-gray-100 text-gray-600' },
  withdrawn: { label: 'Đã rút',      cls: 'bg-gray-100 text-gray-600' },
  scheduled: { label: 'Đã đăng ký',  cls: 'bg-blue-100 text-blue-700' },
};

/* ── Modal đăng ký cuộc đua ── */
function RegisterModal({ horses, onClose, onSuccess }) {
  const [races, setRaces]     = useState([]);
  const [horseId, setHorseId] = useState('');
  const [raceId, setRaceId]   = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    // Dùng public endpoint — không cần auth, hiển thị tất cả races
    api.get('/public/races/live')
      .then(r => setRaces(r.data?.data ?? r.data ?? []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!horseId || !raceId) { setError('Vui lòng chọn ngựa và cuộc đua.'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/registrations', { horse_id: +horseId, race_id: +raceId });
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {})[0]?.[0]
        || 'Không thể đăng ký. Vui lòng thử lại.';
      setError(msg);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Đăng ký cuộc đua</h2>
        <p className="text-gray-500 text-sm mb-6">Chọn ngựa và cuộc đua để đăng ký tham gia</p>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Chọn ngựa *</label>
            <select value={horseId} onChange={e => setHorseId(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">-- Chọn ngựa --</option>
              {horses.map(h => <option key={h.id} value={h.id}>{h.name} ({h.breed})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Cuộc đua *</label>
            <select value={raceId} onChange={e => setRaceId(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">-- Chọn cuộc đua --</option>
              {races.filter(r => r.status === 'scheduled').map(r => (
                <option key={r.id} value={r.id}>
                  {r.name ?? r.round ?? `Cuộc đua #${r.id}`} — {r.distance}m
                  {r.race_time ? ` (${new Date(r.race_time).toLocaleDateString('vi-VN')})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
              {saving ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const RaceRegistrations = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [horses, setHorses]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [toast, setToast]                 = useState('');
  const [cancelling, setCancelling]       = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchData = () => {
    setLoading(true);
    // Lấy danh sách ngựa trước
    api.get('/horse-owner/horses')
      .then(async hRes => {
        const horseList = hRes.data?.data ?? hRes.data ?? [];
        setHorses(horseList);

        // Lấy registrations từ từng ngựa qua schedule endpoint
        const scheduleArrays = await Promise.all(
          horseList.map(h =>
            api.get(`/horse-owner/horses/${h.id}/schedule`)
              .then(r => {
                const races = r.data?.data ?? r.data ?? [];
                return races.map(race => ({
                  ...race,
                  horse_name:  h.name,
                  horse_id:    h.id,
                  race_name:   race.name ?? `Cuộc đua #${race.id}`,
                  race_date:   race.race_time,
                  // registration_status có sẵn từ API đã fix
                  status:      race.registration_status ?? race.status ?? 'pending',
                  reg_id:      race.registration_id,
                  lane:        race.lane,
                  tournament:  race.tournament?.name ?? '—',
                }));
              })
              .catch(() => [])
          )
        );

        // Flatten và loại trùng theo reg_id
        const all = scheduleArrays.flat();
        setRegistrations(all);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleCancel = async (reg) => {
    const regId = reg.reg_id ?? reg.id;
    if (!regId) { alert('Không tìm thấy ID đăng ký.'); return; }
    if (!window.confirm(`Hủy đăng ký ngựa "${reg.horse_name}" khỏi cuộc đua này?`)) return;
    setCancelling(regId);
    try {
      await api.put(`/registrations/${regId}/status`, { status: 'withdrawn' });
      showToast('Đã hủy đăng ký thành công.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hủy đăng ký.');
    } finally { setCancelling(null); }
  };

  return (
    <HorseOwnerLayout>
      <div className="max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Đăng ký cuộc đua</h1>
            <p className="text-gray-500 mt-1 text-sm">Quản lý việc đăng ký tham gia của ngựa bạn</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm"
          >
            + Đăng ký cuộc đua
          </button>
        </div>

        {toast && (
          <div className="mb-5 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">
            ✅ {toast}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Ngựa', 'Cuộc đua', 'Giải đấu', 'Ngày đua', 'Làn', 'Trạng thái', 'Hành động'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <p className="text-3xl mb-2">🏁</p>
                      <p className="text-gray-500 text-sm">Chưa có đăng ký nào. Hãy đăng ký cuộc đua cho ngựa của bạn!</p>
                    </td>
                  </tr>
                ) : registrations.map((reg, idx) => {
                  const s = STATUS_MAP[reg.status] ?? { label: reg.status, cls: 'bg-gray-100 text-gray-600' };
                  const regId = reg.reg_id ?? reg.id;
                  return (
                    <tr key={`${reg.horse_id}-${reg.id}-${idx}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-800 text-sm">{reg.horse_name ?? '—'}</td>
                      <td className="px-5 py-4 text-gray-700 text-sm">{reg.race_name ?? '—'}</td>
                      <td className="px-5 py-4 text-gray-500 text-sm">{reg.tournament ?? '—'}</td>
                      <td className="px-5 py-4 text-gray-500 text-sm">
                        {reg.race_date ? new Date(reg.race_date).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-sm">{reg.lane ?? '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>
                      </td>
                      <td className="px-5 py-4">
                        {(reg.status === 'pending' || reg.status === 'scheduled') && regId && (
                          <button
                            onClick={() => handleCancel(reg)}
                            disabled={cancelling === regId}
                            className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-40"
                          >
                            {cancelling === regId ? 'Đang hủy...' : 'Hủy'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <RegisterModal
          horses={horses}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); showToast('Đã đăng ký thành công!'); fetchData(); }}
        />
      )}
    </HorseOwnerLayout>
  );
};

export default RaceRegistrations;
