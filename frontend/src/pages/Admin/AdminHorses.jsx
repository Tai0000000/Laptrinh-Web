import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

const STATUS_CFG = {
  active:   { label: 'Hoạt động', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  injured:  { label: 'Chấn thương', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  retired:  { label: 'Đã nghỉ hưu', cls: 'bg-slate-700 text-slate-400 border-slate-600' },
  resting:  { label: 'Nghỉ ngơi', cls: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_CFG[status] ?? { label: status, cls: 'bg-slate-700 text-slate-300 border-slate-600' };
  return <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.cls}`}>{s.label}</span>;
};

function HorseModal({ horse, onClose, onSaved }) {
  const isEdit = !!horse?.id;
  const [form, setForm] = useState(isEdit
    ? { name: horse.name ?? '', age: horse.age ?? '', breed: horse.breed ?? '', weight: horse.weight ?? '', status: horse.status ?? 'active' }
    : { name: '', age: '', breed: '', weight: '', status: 'active' }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = { name: form.name, age: +form.age, breed: form.breed, weight: form.weight ? +form.weight : null, status: form.status };
      if (isEdit) await api.put(`/admin/horses/${horse.id}`, payload);
      else        await api.post('/admin/horses', payload);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || Object.values(err.response?.data?.errors || {})[0]?.[0] || 'Lỗi không xác định.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/5 px-7 py-5">
          <h2 className="text-lg font-black text-white">{isEdit ? '✏️ Sửa thông tin ngựa' : '🐴 Thêm ngựa mới'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}
          {[
            { label: 'Tên ngựa', key: 'name', type: 'text', required: true },
            { label: 'Tuổi', key: 'age', type: 'number', required: true },
            { label: 'Giống', key: 'breed', type: 'text', required: true },
            { label: 'Cân nặng (kg)', key: 'weight', type: 'number', required: false },
          ].map(({ label, key, type, required }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">{label}{required && ' *'}</label>
              <input type={type} value={form[key]} required={required} onChange={e => set(key, e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500 placeholder:text-slate-600" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Trạng thái</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500">
              <option value="active">Hoạt động</option>
              <option value="injured">Chấn thương</option>
              <option value="resting">Nghỉ ngơi</option>
              <option value="retired">Đã nghỉ hưu</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50">
              {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm ngựa'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminHorses() {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/admin/horses');
      setHorses(res.data?.data ?? res.data ?? []);
    } catch (e) { setError(e.response?.data?.message || 'Không thể tải danh sách ngựa.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (horse) => {
    if (!window.confirm(`Xóa ngựa "${horse.name}"? Không thể hoàn tác.`)) return;
    setDeleting(horse.id);
    try {
      await api.delete(`/admin/horses/${horse.id}`);
      showToast(`Đã xóa ngựa "${horse.name}"`);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Không thể xóa.'); }
    finally { setDeleting(null); }
  };

  const displayed = horses.filter(h => {
    const matchS = !search || h.name?.toLowerCase().includes(search.toLowerCase()) || h.breed?.toLowerCase().includes(search.toLowerCase());
    const matchSt = !statusFilter || h.status === statusFilter;
    return matchS && matchSt;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Quản trị</p>
          <h2 className="text-3xl font-black tracking-tight text-white">Quản lý Ngựa</h2>
          <p className="text-sm text-slate-400 mt-1">{horses.length} ngựa trong hệ thống</p>
        </div>
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5">
          ＋ Thêm ngựa mới
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input type="text" placeholder="Tìm theo tên, giống..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-2xl text-sm text-slate-200 outline-none focus:border-emerald-400 placeholder:text-slate-500 transition" />
        </div>
        <div className="flex rounded-2xl border border-white/10 overflow-hidden">
          {[['', 'Tất cả'], ['active', 'Hoạt động'], ['injured', 'Chấn thương'], ['resting', 'Nghỉ ngơi'], ['retired', 'Nghỉ hưu']].map(([v, l]) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              className={`px-3 py-2 text-xs font-bold transition ${statusFilter === v ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-950/40 text-slate-400 hover:text-slate-200'}`}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={load} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition">🔄 Làm mới</button>
      </div>

      {toast && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">✅ {toast}</div>}
      {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-slate-950/70 border-b border-white/5">
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {['ID', 'Tên ngựa', 'Giống', 'Tuổi', 'Cân nặng', 'Chủ sở hữu', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} className="px-4 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-4 rounded-xl bg-white/8 animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : displayed.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-16 text-center text-slate-500">
                  <p className="text-4xl mb-2">🐴</p><p className="text-sm">Không có ngựa nào.</p>
                </td></tr>
              ) : displayed.map(horse => (
                <tr key={horse.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-4 text-slate-500 font-mono text-xs">#{horse.id}</td>
                  <td className="px-4 py-4 font-semibold text-white">{horse.name}</td>
                  <td className="px-4 py-4 text-slate-400">{horse.breed ?? '—'}</td>
                  <td className="px-4 py-4 text-slate-300">{horse.age} tuổi</td>
                  <td className="px-4 py-4 text-slate-400">{horse.weight ? `${horse.weight} kg` : '—'}</td>
                  <td className="px-4 py-4 text-slate-400 text-xs">{horse.owner?.name ?? horse.owner_name ?? '—'}</td>
                  <td className="px-4 py-4"><StatusBadge status={horse.status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setModal(horse)}
                        className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-[11px] font-bold text-sky-400 hover:bg-sky-500/20 transition">✏️ Sửa</button>
                      <button onClick={() => handleDelete(horse)} disabled={deleting === horse.id}
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-bold text-rose-400 hover:bg-rose-500/20 transition disabled:opacity-40">
                        {deleting === horse.id ? '...' : '🗑️ Xóa'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && <div className="border-t border-white/5 px-5 py-3 text-xs text-slate-500">Tổng: {displayed.length} / {horses.length} ngựa</div>}
      </div>

      {modal && (
        <HorseModal
          horse={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); showToast(modal === 'create' ? 'Đã thêm ngựa thành công!' : 'Đã cập nhật thông tin ngựa!'); load(); }}
        />
      )}
    </div>
  );
}
