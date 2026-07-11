import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

/* ── Prize table (khớp với backend calculatePrize) ── */
const PRIZE_MAP = {
    1: '50,000,000 VNĐ',
    2: '25,000,000 VNĐ',
    3: '10,000,000 VNĐ',
    4: '5,000,000 VNĐ',
};

const getPrize = (rank) => PRIZE_MAP[rank] ?? 'Không có thưởng';

/* ── Race status badge ── */
const StatusBadge = ({ status }) => {
    const map = {
        scheduled: { label: 'Sắp diễn ra', cls: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
        ongoing:   { label: 'Đang đua',     cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
        finished:  { label: 'Đã xong',      cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    };
    const s = map[status] ?? { label: status, cls: 'bg-slate-700 text-slate-400 border-slate-600' };
    return (
        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.cls}`}>
            {s.label}
        </span>
    );
};

/* ══════════════════════════════════════════════════════════
   Sub-view: Nhập kết quả cho một cuộc đua cụ thể
══════════════════════════════════════════════════════════ */
const ResultForm = ({ race, onBack, onPublished }) => {
    const [rows, setRows]       = useState([]);
    const [saving, setSaving]   = useState(false);
    const [error, setError]     = useState('');
    const [success, setSuccess] = useState(false);

    /* Build rows from race registrations + existing results */
    useEffect(() => {
        // Luôn fetch existing results (cả khi scheduled/ongoing/finished)
        const loadExisting = async () => {
            let existingResults = [];
            try {
                const r = await api.get(`/admin/races/${race.id}/results`);
                existingResults = r.data?.data || r.data || [];
            } catch {}

            const existingMap = new Map(existingResults.map(r => [r.registration_id, r]));
            const built = (race.registrations || []).map((reg, i) => {
                const ex = existingMap.get(reg.id);
                return {
                    registration_id: reg.id,
                    lane:        reg.lane ?? i + 1,
                    // AdminUserController trả horse là string, RefereeController trả object
                    horse_name:  (typeof reg.horse === 'string' ? reg.horse : reg.horse?.name) ?? 'N/A',
                    rank:        ex?.rank ?? '',
                    finish_time: ex?.finish_time ?? '',
                    notes:       ex?.notes ?? '',
                    auto_filled: !!ex,
                };
            });
            setRows(built.sort((a, b) => {
                if (existingResults.length > 0 && a.rank && b.rank) return Number(a.rank) - Number(b.rank);
                return a.lane - b.lane;
            }));
        };
        loadExisting();
    }, [race]);

    const updateRow = (id, field, value) =>
        setRows(prev => prev.map(r => r.registration_id === id ? { ...r, [field]: value } : r));

    const validate = () => {
        if (rows.length === 0) return 'Cuộc đua này chưa có ngựa tham gia.';
        const ranks = rows.map(r => Number(r.rank));
        if (rows.some(r => !r.rank || !r.finish_time?.trim())) return 'Vui lòng nhập đầy đủ hạng và thời gian cho tất cả ngựa.';
        if (ranks.some(n => isNaN(n) || n < 1))                 return 'Hạng phải là số nguyên >= 1.';
        if (new Set(ranks).size !== ranks.length)                return 'Các hạng không được trùng nhau.';
        return '';
    };

    const handleSubmit = async () => {
        const err = validate();
        if (err) { setError(err); return; }
        setSaving(true);
        setError('');
        try {
            await api.post(`/admin/races/${race.id}/results`, {
                results: rows.map(r => ({
                    registration_id: r.registration_id,
                    rank:            Number(r.rank),
                    finish_time:     r.finish_time,
                    notes:           r.notes || null,
                })),
            });
            setSuccess(true);
            onPublished && onPublished(race.id);
        } catch (e) {
            const errs = e.response?.data?.errors;
            setError(errs ? Object.values(errs).flat()[0] : e.response?.data?.message || 'Không thể lưu kết quả.');
        } finally {
            setSaving(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Kết quả đã được publish!</h3>
                <p className="text-sm text-slate-400 text-center max-w-sm">
                    Kết quả chính thức đã lưu, race chuyển sang trạng thái <strong>finished</strong>, và các cược liên quan đã được phân giải.
                </p>
                <button
                    onClick={onBack}
                    className="mt-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-6 py-2.5 text-sm font-bold text-emerald-400 hover:bg-emerald-500/30 transition"
                >
                    ← Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Sub-header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <button onClick={onBack} className="text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300">
                        ← Quay lại danh sách
                    </button>
                    <h3 className="mt-2 text-2xl font-extrabold text-white">{race.name}</h3>
                    <p className="text-sm text-slate-400">{race.tournament} · Vòng {race.round ?? '—'}</p>
                </div>
                <StatusBadge status={race.status} />
            </div>

            {/* Banner kết quả tự động */}
            {rows.some(r => r.auto_filled) && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <span className="text-emerald-400 text-xl">🏁</span>
                    <p className="text-sm font-bold text-emerald-400">
                        Kết quả đã được ghi nhận tự động từ hệ thống simulation.
                        Kiểm tra và publish chính thức bên dưới.
                    </p>
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-300">{error}</div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm">
                        <thead className="bg-slate-950/70 border-b border-white/5">
                            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <th className="px-4 py-4">Làn</th>
                                <th className="px-4 py-4">Ngựa</th>
                                <th className="px-4 py-4">Hạng *</th>
                                <th className="px-4 py-4">Thời gian *</th>
                                <th className="px-4 py-4">Phần thưởng</th>
                                <th className="px-4 py-4">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                                        Cuộc đua chưa có ngựa tham gia.
                                    </td>
                                </tr>
                            ) : rows.map(row => (
                                <tr key={row.registration_id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-3 font-bold text-amber-400">{row.lane}</td>
                                    <td className="px-4 py-3 font-semibold text-white">{row.horse_name}</td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="number"
                                            min="1"
                                            value={row.rank}
                                            onChange={e => updateRow(row.registration_id, 'rank', e.target.value)}
                                            className="w-20 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-amber-500 text-sm"
                                            placeholder="1"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="text"
                                            value={row.finish_time}
                                            onChange={e => updateRow(row.registration_id, 'finish_time', e.target.value)}
                                            className="w-32 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-amber-500 text-sm"
                                            placeholder="01:12.530"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        {row.rank ? (
                                            <span className={`text-xs font-semibold ${Number(row.rank) <= 4 ? 'text-yellow-400' : 'text-slate-500'}`}>
                                                {getPrize(Number(row.rank))}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-600">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="text"
                                            value={row.notes}
                                            onChange={e => updateRow(row.registration_id, 'notes', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-amber-500 text-sm"
                                            placeholder="Ghi chú (tuỳ chọn)"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button
                    onClick={onBack}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800 transition"
                >
                    Huỷ
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={saving || rows.length === 0}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/10 hover:from-amber-600 hover:to-yellow-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {saving ? 'Đang lưu...' : '🏁 Publish kết quả chính thức'}
                </button>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════
   Main view: Danh sách races để chọn
══════════════════════════════════════════════════════════ */
export default function AdminResultEntry() {
    const [races,        setRaces]       = useState([]);
    const [tournaments,  setTournaments] = useState([]);
    const [loading,      setLoading]     = useState(true);
    const [error,        setError]       = useState('');
    const [selectedRace, setSelectedRace] = useState(null);
    const [tournamentFilter, setTournamentFilter] = useState('');
    const [statusFilter,     setStatusFilter]     = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [rRes, tRes] = await Promise.all([
                api.get('/admin/races'),
                api.get('/tournaments'),
            ]);
            setRaces(rRes.data?.data ?? rRes.data ?? []);
            setTournaments(tRes.data?.data ?? tRes.data ?? []);
        } catch (e) {
            setError(e.response?.data?.message || 'Không thể tải dữ liệu.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    /* Khi publish xong, refresh và quay lại */
    const handlePublished = (raceId) => {
        setRaces(prev => prev.map(r => r.id === raceId ? { ...r, status: 'finished' } : r));
    };

    const handleBack = () => {
        setSelectedRace(null);
        fetchData();
    };

    /* Nếu đang ở màn nhập kết quả */
    if (selectedRace) {
        return (
            <ResultForm
                race={selectedRace}
                onBack={handleBack}
                onPublished={handlePublished}
            />
        );
    }

    /* Filtered races */
    const displayed = races.filter(r => {
        const matchTournament = !tournamentFilter || String(r.tournament_id) === String(tournamentFilter);
        const matchStatus     = !statusFilter     || r.status === statusFilter;
        return matchTournament && matchStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Quản trị</p>
                <h2 className="text-3xl font-black tracking-tight text-white">Nhập kết quả Admin</h2>
                <p className="mt-1 text-sm text-slate-400">
                    Chọn cuộc đua để nhập finish position + time và publish kết quả chính thức
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <select
                    value={tournamentFilter}
                    onChange={e => setTournamentFilter(e.target.value)}
                    className="bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-2 text-xs text-slate-200 outline-none focus:border-emerald-400 cursor-pointer"
                >
                    <option value="">Tất cả giải đấu</option>
                    {tournaments.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-2 text-xs text-slate-200 outline-none focus:border-emerald-400 cursor-pointer"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="scheduled">Sắp diễn ra</option>
                    <option value="ongoing">Đang đua</option>
                    <option value="finished">Đã xong</option>
                </select>
                <button
                    onClick={fetchData}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
                >
                    🔄 Làm mới
                </button>
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-300">{error}</div>
            )}

            {/* Race cards grid */}
            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-44 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-500">
                    <span className="text-4xl">🏇</span>
                    <p className="text-sm">Không có cuộc đua nào.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {displayed.map(race => (
                        <div
                            key={race.id}
                            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 p-5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-200 cursor-pointer"
                            onClick={() => setSelectedRace(race)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-bold text-white group-hover:text-amber-400 transition-colors">{race.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{race.tournament}</p>
                                </div>
                                <StatusBadge status={race.status} />
                            </div>
                            <div className="space-y-1.5 text-xs text-slate-400">
                                <p>🕐 {race.race_time ? new Date(race.race_time).toLocaleString('vi-VN') : '—'}</p>
                                <p>🔄 Vòng: <span className="text-slate-300 font-semibold">{race.round ?? '—'}</span></p>
                                <p>🐴 Ngựa tham gia: <span className="text-slate-300 font-semibold">{race.registrations?.length ?? 0}</span></p>
                            </div>
                            <div className="mt-4">
                                {race.status === 'finished' ? (
                                    <span className="text-xs font-semibold text-emerald-400">✅ Đã có kết quả — Click để chỉnh sửa</span>
                                ) : (
                                    <span className="text-xs font-semibold text-amber-400 group-hover:underline">
                                        → Nhập kết quả
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
