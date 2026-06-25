import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

/* ── Prize medal helper ─────────────────────────────────── */
const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

const RankCell = ({ rank }) => {
    if (rank <= 3) {
        return (
            <span className="flex items-center gap-1.5 font-black text-base">
                {MEDALS[rank]}
                <span className={rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-300' : 'text-amber-600'}>
                    #{rank}
                </span>
            </span>
        );
    }
    return <span className="font-bold text-slate-400">#{rank}</span>;
};

const PrizeCell = ({ prize }) => {
    const hasPrize = prize && prize !== 'Không có thưởng';
    return (
        <span className={`text-xs font-semibold ${hasPrize ? 'text-yellow-400' : 'text-slate-600'}`}>
            {hasPrize ? `💰 ${prize}` : '—'}
        </span>
    );
};

/* ── Main Component ──────────────────────────────────────── */
export default function AdminLeaderboard() {
    const [results,      setResults]      = useState([]);
    const [tournaments,  setTournaments]  = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState('');

    // Filters
    const [tournamentFilter, setTournamentFilter] = useState('');
    const [roundFilter,      setRoundFilter]      = useState('');
    const [raceFilter,       setRaceFilter]       = useState('');

    /* Unique rounds from results */
    const [availableRounds, setAvailableRounds] = useState([]);

    /* Tải tournaments */
    useEffect(() => {
        api.get('/tournaments')
            .then(r => setTournaments(r.data || []))
            .catch(() => {});
    }, []);

    /* Tải leaderboard */
    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (tournamentFilter) params.append('tournament_id', tournamentFilter);
            if (roundFilter)      params.append('round',         roundFilter);
            if (raceFilter)       params.append('race_id',       raceFilter);
            const res = await api.get(`/admin/leaderboard?${params}`);
            const data = res.data || [];
            setResults(data);

            // Extract unique rounds từ kết quả
            const rounds = [...new Set(data.map(r => r.round).filter(Boolean))].sort();
            setAvailableRounds(rounds);
        } catch (e) {
            setError(e.response?.data?.message || 'Không thể tải bảng xếp hạng.');
        } finally {
            setLoading(false);
        }
    }, [tournamentFilter, roundFilter, raceFilter]);

    useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

    /* Khi đổi tournament, reset round & race filter */
    const handleTournamentChange = (val) => {
        setTournamentFilter(val);
        setRoundFilter('');
        setRaceFilter('');
    };

    /* Summary stats */
    const totalHorses  = results.length;
    const totalPrize   = results.filter(r => r.prize && r.prize !== 'Không có thưởng').length;
    const uniqueRaces  = [...new Set(results.map(r => r.race))].length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Quản trị</p>
                <h2 className="text-3xl font-black tracking-tight text-white">Bảng xếp hạng Giải đấu</h2>
                <p className="mt-1 text-sm text-slate-400">
                    Leaderboard theo tournament · filter vòng · hiển thị phần thưởng
                </p>
            </div>

            {/* Summary cards */}
            {!loading && results.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { icon: '🐴', label: 'Lượt xếp hạng', value: totalHorses,  color: 'from-sky-500/20 to-sky-500/5 border-sky-500/30' },
                        { icon: '🏁', label: 'Cuộc đua',       value: uniqueRaces,  color: 'from-violet-500/20 to-violet-500/5 border-violet-500/30' },
                        { icon: '💰', label: 'Lượt có thưởng', value: totalPrize,   color: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30' },
                    ].map(card => (
                        <div key={card.label} className={`rounded-2xl border bg-gradient-to-br ${card.color} p-5`}>
                            <span className="text-2xl">{card.icon}</span>
                            <p className="mt-3 text-3xl font-black text-white">{card.value}</p>
                            <p className="text-xs text-slate-400 uppercase tracking-wide mt-0.5">{card.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                {/* Tournament */}
                <select
                    value={tournamentFilter}
                    onChange={e => handleTournamentChange(e.target.value)}
                    className="bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-2 text-xs text-slate-200 outline-none focus:border-emerald-400 cursor-pointer"
                >
                    <option value="">Tất cả giải đấu</option>
                    {tournaments.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>

                {/* Round — hiển thị sau khi có kết quả */}
                <select
                    value={roundFilter}
                    onChange={e => setRoundFilter(e.target.value)}
                    className="bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-2 text-xs text-slate-200 outline-none focus:border-emerald-400 cursor-pointer"
                >
                    <option value="">Tất cả vòng</option>
                    {availableRounds.map(r => (
                        <option key={r} value={r}>Vòng {r}</option>
                    ))}
                </select>

                <button
                    onClick={fetchLeaderboard}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
                >
                    🔄 Làm mới
                </button>
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-300">{error}</div>
            )}

            {/* Leaderboard Table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm">
                        <thead className="bg-slate-950/70 border-b border-white/5">
                            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <th className="px-5 py-4">Hạng</th>
                                <th className="px-5 py-4">Ngựa</th>
                                <th className="px-5 py-4">Thời gian</th>
                                <th className="px-5 py-4">Cuộc đua</th>
                                <th className="px-5 py-4">Giải đấu</th>
                                <th className="px-5 py-4">Vòng</th>
                                <th className="px-5 py-4">Phần thưởng</th>
                                <th className="px-5 py-4">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(8)].map((_, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 rounded-xl bg-white/8 animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : results.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-500">
                                            <span className="text-4xl">🏆</span>
                                            <p className="text-sm">Chưa có kết quả nào. Hãy chọn giải đấu hoặc publish kết quả trước.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                results.map((r, idx) => (
                                    <tr
                                        key={idx}
                                        className={`transition-colors hover:bg-white/[0.02] ${
                                            r.rank === 1 ? 'bg-yellow-500/[0.03]' :
                                            r.rank === 2 ? 'bg-slate-400/[0.03]' :
                                            r.rank === 3 ? 'bg-amber-700/[0.03]' : ''
                                        }`}
                                    >
                                        <td className="px-5 py-4"><RankCell rank={r.rank} /></td>
                                        <td className="px-5 py-4 font-bold text-white">{r.horse}</td>
                                        <td className="px-5 py-4 font-mono text-slate-300">{r.finish_time ?? '—'}</td>
                                        <td className="px-5 py-4 text-slate-400">{r.race}</td>
                                        <td className="px-5 py-4 text-slate-400">{r.tournament}</td>
                                        <td className="px-5 py-4 text-slate-400">
                                            {r.round ? `Vòng ${r.round}` : '—'}
                                        </td>
                                        <td className="px-5 py-4"><PrizeCell prize={r.prize} /></td>
                                        <td className="px-5 py-4 text-xs text-slate-500 italic">{r.notes || '—'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && results.length > 0 && (
                    <div className="border-t border-white/5 px-5 py-3 text-xs text-slate-500">
                        Tổng: {results.length} kết quả
                    </div>
                )}
            </div>
        </div>
    );
}
