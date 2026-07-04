import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

/* ── Status helpers ───────────────────────────────────────── */
const STATUS_MAP = {
    pending:   { label: 'Chờ duyệt',  cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    confirmed: { label: 'Đã duyệt',   cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    rejected:  { label: 'Từ chối',    cls: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    withdrawn: { label: 'Đã rút',     cls: 'bg-slate-700 text-slate-400 border-slate-600' },
};

const StatusBadge = ({ status }) => {
    const s = STATUS_MAP[status] ?? { label: status, cls: 'bg-slate-700 text-slate-300 border-slate-600' };
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.cls}`}>
            {s.label}
        </span>
    );
};

/* ── Main Component ──────────────────────────────────────── */
export default function AdminRegistrations() {
    const [registrations, setRegistrations] = useState([]);
    const [tournaments,   setTournaments]   = useState([]);
    const [races,         setRaces]         = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [error,         setError]         = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [toast,         setToast]         = useState('');

    // Filters
    const [statusFilter,     setStatusFilter]     = useState('pending');
    const [tournamentFilter, setTournamentFilter] = useState('');
    const [raceFilter,       setRaceFilter]       = useState('');

    /* ── Tải tournaments và races để làm filter dropdown ── */
    useEffect(() => {
        Promise.all([
            api.get('/tournaments'),
            api.get('/admin/races'),
        ]).then(([tRes, rRes]) => {
            setTournaments(tRes.data?.data ?? tRes.data ?? []);
            setRaces(rRes.data?.data ?? rRes.data ?? []);
        }).catch(() => {});
    }, []);

    /* ── Tải danh sách registrations ── */
    const fetchRegistrations = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (statusFilter)     params.append('status',        statusFilter);
            if (tournamentFilter) params.append('tournament_id', tournamentFilter);
            if (raceFilter)       params.append('race_id',       raceFilter);
            const res = await api.get(`/admin/registrations?${params}`);
            setRegistrations(res.data);
        } catch (e) {
            setError(e.response?.data?.message || 'Không thể tải danh sách đăng ký.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, tournamentFilter, raceFilter]);

    useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

    /* ── Approve / Reject ── */
    const handleUpdateStatus = async (id, newStatus) => {
        setActionLoading(id);
        try {
            await api.put(`/admin/registrations/${id}/status`, { status: newStatus });
            setRegistrations(prev => prev.map(r =>
                r.id === id ? { ...r, status: newStatus } : r
            ));
            showToast(newStatus === 'confirmed' ? '✅ Đã duyệt đăng ký' : '❌ Đã từ chối đăng ký');
        } catch (e) {
            alert(e.response?.data?.message || 'Thao tác thất bại.');
        } finally {
            setActionLoading(null);
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    /* ── Races filtered by tournament ── */
    const filteredRaces = tournamentFilter
        ? races.filter(r => String(r.tournament_id) === tournamentFilter || r.tournament === tournaments.find(t => t.id === Number(tournamentFilter))?.name)
        : races;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Quản trị</p>
                <h2 className="text-3xl font-black tracking-tight text-white">Duyệt Đăng ký Thi đấu</h2>
                <p className="mt-1 text-sm text-slate-400">Xem xét, phê duyệt hoặc từ chối các đơn đăng ký</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                {/* Status filter pills */}
                <div className="flex rounded-2xl border border-white/10 overflow-hidden">
                    {[
                        { val: 'pending',   label: 'Chờ duyệt' },
                        { val: 'confirmed', label: 'Đã duyệt'  },
                        { val: 'rejected',  label: 'Từ chối'   },
                        { val: '',          label: 'Tất cả'    },
                    ].map(s => (
                        <button
                            key={s.val}
                            onClick={() => setStatusFilter(s.val)}
                            className={`px-4 py-2 text-xs font-bold transition ${
                                statusFilter === s.val
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-slate-950/40 text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Tournament dropdown */}
                <select
                    value={tournamentFilter}
                    onChange={e => { setTournamentFilter(e.target.value); setRaceFilter(''); }}
                    className="bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-2 text-xs text-slate-200 outline-none focus:border-emerald-400 cursor-pointer"
                >
                    <option value="">Tất cả giải đấu</option>
                    {tournaments.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>

                {/* Race dropdown */}
                <select
                    value={raceFilter}
                    onChange={e => setRaceFilter(e.target.value)}
                    className="bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-2 text-xs text-slate-200 outline-none focus:border-emerald-400 cursor-pointer"
                >
                    <option value="">Tất cả cuộc đua</option>
                    {filteredRaces.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>

                <button
                    onClick={fetchRegistrations}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
                >
                    🔄 Làm mới
                </button>

                {/* Counter badge */}
                {statusFilter === 'pending' && registrations.length > 0 && (
                    <span className="ml-auto rounded-full bg-rose-500/20 border border-rose-500/30 px-3 py-1 text-xs font-bold text-rose-400">
                        {registrations.length} chờ duyệt
                    </span>
                )}
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-300">{error}</div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-sm">
                        <thead className="bg-slate-950/70 border-b border-white/5">
                            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <th className="px-5 py-4">ID</th>
                                <th className="px-5 py-4">Ngựa</th>
                                <th className="px-5 py-4">Cuộc đua</th>
                                <th className="px-5 py-4">Giải đấu</th>
                                <th className="px-5 py-4">Thời gian đua</th>
                                <th className="px-5 py-4">Làn</th>
                                <th className="px-5 py-4">Trạng thái</th>
                                <th className="px-5 py-4">Ngày đăng ký</th>
                                <th className="px-5 py-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(9)].map((_, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 rounded-xl bg-white/8 animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : registrations.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-5 py-14 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-500">
                                            <span className="text-4xl">📭</span>
                                            <p className="text-sm">Không có đăng ký nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                registrations.map(reg => (
                                    <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-4 text-slate-500 font-mono text-xs">#{reg.id}</td>
                                        <td className="px-5 py-4 font-semibold text-white">{reg.horse}</td>
                                        <td className="px-5 py-4 text-slate-300">{reg.race}</td>
                                        <td className="px-5 py-4 text-slate-400">{reg.tournament}</td>
                                        <td className="px-5 py-4 text-slate-400 text-xs">
                                            {reg.race_time ? new Date(reg.race_time).toLocaleString('vi-VN') : '—'}
                                        </td>
                                        <td className="px-5 py-4 text-amber-400 font-bold">
                                            {reg.lane ?? '—'}
                                        </td>
                                        <td className="px-5 py-4"><StatusBadge status={reg.status} /></td>
                                        <td className="px-5 py-4 text-slate-500 text-xs">
                                            {new Date(reg.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {reg.status === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(reg.id, 'confirmed')}
                                                            disabled={actionLoading === reg.id}
                                                            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition disabled:opacity-50"
                                                        >
                                                            {actionLoading === reg.id ? '...' : '✅ Duyệt'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(reg.id, 'rejected')}
                                                            disabled={actionLoading === reg.id}
                                                            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition disabled:opacity-50"
                                                        >
                                                            {actionLoading === reg.id ? '...' : '❌ Từ chối'}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-slate-600">—</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && (
                    <div className="border-t border-white/5 px-5 py-3 text-xs text-slate-500">
                        Tổng: {registrations.length} đăng ký
                    </div>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-300 shadow-2xl backdrop-blur-xl animate-fade-in">
                    {toast}
                </div>
            )}
        </div>
    );
}
