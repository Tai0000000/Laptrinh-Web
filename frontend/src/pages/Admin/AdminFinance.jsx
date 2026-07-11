import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

/* ── Helpers ──────────────────────────────────────────────── */
const VND = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n ?? 0);

const STATUS_CFG = {
  pending:  { label: 'Chờ xử lý', cls: 'bg-amber-500/20  text-amber-400  border-amber-500/30'  },
  won:      { label: 'Thắng',     cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  lost:     { label: 'Thua',      cls: 'bg-rose-500/20   text-rose-400   border-rose-500/30'   },
  refunded: { label: 'Hoàn tiền', cls: 'bg-sky-500/20    text-sky-400    border-sky-500/30'    },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] ?? { label: status, cls: 'bg-slate-700 text-slate-300 border-slate-600' };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const StatCard = ({ icon, label, value, sub, color = 'emerald' }) => (
  <div className={`rounded-2xl border border-white/10 bg-slate-950/50 p-5`}>
    <div className="flex items-center gap-3 mb-3">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${color}-500/15 text-xl`}>{icon}</span>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    </div>
    <p className={`text-2xl font-black text-white`}>{value}</p>
    {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
  </div>
);

/* ── Settle Modal ─────────────────────────────────────────── */
function SettleModal({ bet, onClose, onSettled }) {
  const [status, setStatus]   = useState('won');
  const [reward, setReward]   = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      await api.put(`/admin/finance/bets/${bet.id}/settle`, {
        status,
        reward_amount: status === 'won' ? Number(reward) : 0,
      });
      onSettled();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Xử lý thất bại.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-base font-bold text-white">Xử lý cược #{bet.id}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {bet.user_name} — <span className="text-white font-semibold">{VND(bet.amount)}</span>
          </p>
          <p className="text-xs text-slate-500">Ngựa: {bet.horse_name} · Loại: {bet.prediction_type}</p>
        </div>
        <div className="p-6 space-y-4">
          {error && <p className="text-sm text-rose-400 font-semibold">{error}</p>}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kết quả</label>
            <div className="mt-2 flex gap-2">
              {['won', 'lost', 'refunded'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 rounded-xl border py-2 text-xs font-bold transition ${
                    status === s
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {STATUS_CFG[s]?.label ?? s}
                </button>
              ))}
            </div>
          </div>
          {status === 'won' && (
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiền thưởng (VNĐ)</label>
              <input
                type="number"
                min={0}
                placeholder="Nhập số tiền thưởng..."
                value={reward}
                onChange={e => setReward(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-400 transition"
              />
            </div>
          )}
        </div>
        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/10 transition">
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || (status === 'won' && !reward)}
            className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-bold text-slate-950 hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-50"
          >
            {saving ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Revenue Chart (simple bar) ───────────────────────────── */
function RevenueChart({ data = [] }) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-32 text-slate-500 text-sm">Chưa có dữ liệu doanh thu</div>
  );
  const maxBet = Math.max(...data.map(d => d.total_bet), 1);
  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-1 min-w-max h-32 px-2">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1 group" style={{ minWidth: 32 }}>
            <div
              className="w-full rounded-t bg-emerald-500/60 hover:bg-emerald-400 transition-all relative"
              style={{ height: `${Math.max(4, (d.total_bet / maxBet) * 120)}px` }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex flex-col items-center pointer-events-none z-10">
                <div className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white whitespace-nowrap">
                  <p>Cược: {VND(d.total_bet)}</p>
                  <p>Payout: {VND(d.total_payout)}</p>
                  <p>Số cược: {d.bet_count}</p>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-slate-500 rotate-45 origin-left">{String(d.period).slice(-5)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function AdminFinance() {
  const [summary, setSummary]   = useState(null);
  const [bets, setBets]         = useState([]);
  const [meta, setMeta]         = useState({});
  const [revenue, setRevenue]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [betsLoading, setBetsLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [period, setPeriod]     = useState('daily');
  const [settleModal, setSettleModal] = useState(null);

  // Load summary + revenue
  useEffect(() => {
    Promise.all([
      api.get('/admin/finance/summary'),
      api.get(`/admin/finance/revenue?period=${period}`),
    ]).then(([s, r]) => {
      setSummary(s.data);
      setRevenue(r.data);
    }).finally(() => setLoading(false));
  }, [period]);

  // Load bets list
  const fetchBets = useCallback(async () => {
    setBetsLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (statusFilter) params.append('status', statusFilter);
      if (search)       params.append('search', search);
      const r = await api.get(`/admin/finance/bets?${params}`);
      setBets(r.data.data ?? []);
      setMeta({ total: r.data.total, lastPage: r.data.last_page, currentPage: r.data.current_page });
    } catch {
      setBets([]);
    } finally { setBetsLoading(false); }
  }, [statusFilter, search, page]);

  useEffect(() => { fetchBets(); }, [fetchBets]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Quản trị</p>
        <h2 className="text-3xl font-black tracking-tight text-white">Quản lý Tài chính</h2>
        <p className="mt-1 text-sm text-slate-400">Tổng quan doanh thu, giao dịch cược và quyết toán</p>
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon="💰" label="Tổng tiền cược"   value={VND(summary.total_bet_amount)}  sub={`${summary.total_bets} giao dịch`}   color="emerald" />
          <StatCard icon="🏆" label="Tổng payout"      value={VND(summary.total_payout)}      sub={`${summary.won_bets} lần thắng`}     color="sky"     />
          <StatCard icon="📈" label="Doanh thu ròng"   value={VND(summary.total_revenue)}     sub="Cược - Payout"                       color="violet"  />
          <StatCard icon="⏳" label="Chờ xử lý"        value={summary.pending_bets}           sub={`Ví người dùng: ${VND(summary.total_wallets)}`} color="amber" />
        </div>
      )}

      {/* Revenue chart */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">📊 Biểu đồ doanh thu</h3>
          <div className="flex gap-2">
            {[['daily','Ngày'],['weekly','Tuần'],['monthly','Tháng']].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setPeriod(v)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  period === v
                    ? 'bg-emerald-500 text-slate-950'
                    : 'border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <RevenueChart data={revenue} />
      </div>

      {/* Bets table */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Tìm theo tên / email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-2xl text-sm text-slate-200 outline-none focus:border-emerald-400 placeholder:text-slate-500 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_CFG).map(([v, { label }]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
          <button onClick={fetchBets} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition">
            🔄 Làm mới
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead className="bg-slate-950/70 border-b border-white/5">
                <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Người dùng</th>
                  <th className="px-5 py-4">Ngựa</th>
                  <th className="px-5 py-4">Cuộc đua</th>
                  <th className="px-5 py-4">Loại cược</th>
                  <th className="px-5 py-4">Số tiền</th>
                  <th className="px-5 py-4">Thưởng</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4">Ngày</th>
                  <th className="px-5 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {betsLoading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(10)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 rounded-xl bg-white/8 animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : bets.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center text-slate-500">
                      Không có giao dịch nào.
                    </td>
                  </tr>
                ) : (
                  bets.map(bet => (
                    <tr key={bet.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 text-slate-500 font-mono text-xs">#{bet.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{bet.user_name}</p>
                        <p className="text-xs text-slate-500">{bet.user_email}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-300">{bet.horse_name}</td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{bet.race_name}</td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{bet.prediction_type}</td>
                      <td className="px-5 py-4 font-semibold text-white">{VND(bet.amount)}</td>
                      <td className="px-5 py-4 text-emerald-400 font-semibold">
                        {bet.reward_amount > 0 ? VND(bet.reward_amount) : '—'}
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={bet.status} /></td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {new Date(bet.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {bet.status === 'pending' ? (
                          <button
                            onClick={() => setSettleModal(bet)}
                            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
                          >
                            Xử lý
                          </button>
                        ) : (
                          <span className="text-slate-600 text-xs">Đã xong</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!betsLoading && meta.lastPage > 1 && (
            <div className="border-t border-white/5 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
              <span>Tổng: {meta.total} giao dịch</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-white/10 px-3 py-1 hover:bg-white/5 disabled:opacity-30 transition"
                >
                  ← Trước
                </button>
                <span className="px-3 py-1 text-slate-300">
                  {page} / {meta.lastPage}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(meta.lastPage, p + 1))}
                  disabled={page >= meta.lastPage}
                  className="rounded-lg border border-white/10 px-3 py-1 hover:bg-white/5 disabled:opacity-30 transition"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settle Modal */}
      {settleModal && (
        <SettleModal
          bet={settleModal}
          onClose={() => setSettleModal(null)}
          onSettled={fetchBets}
        />
      )}
    </div>
  );
}
