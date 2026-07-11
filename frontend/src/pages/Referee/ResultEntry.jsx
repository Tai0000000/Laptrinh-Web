import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RefereeLayout from '../../components/RefereeLayout';
import api from '../../api/axios';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080';

const ResultEntry = () => {
  const { raceId }  = useParams();
  const navigate    = useNavigate();
  const [race, setRace]               = useState(null);
  const [rows, setRows]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [confirming, setConfirming]   = useState(false);
  const [error, setError]             = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [autoResultLoaded, setAutoResultLoaded] = useState(false); // kết quả đã tự động load chưa
  const [wsStatus, setWsStatus]       = useState('disconnected');
  const [editMode, setEditMode]       = useState(false); // cho phép chỉnh sửa thủ công
  const wsRef = useRef(null);

  // ── Load dữ liệu race + kết quả đã có ─────────────────────────────────
  const fetchRaceAndResults = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [raceResponse, resultResponse, violationResponse] = await Promise.all([
        api.get(`/referee/races/${raceId}`),
        api.get(`/referee/races/${raceId}/results`).catch(() => ({ data: { data: [] } })),
        api.get(`/referee/violations?race_id=${raceId}`).catch(() => ({ data: { data: [] } })),
      ]);

      const raceData       = raceResponse.data?.data;
      const existingResults = resultResponse.data?.data || [];
      const resultMap      = new Map(existingResults.map(r => [Number(r.registration_id), r]));

      const vList = violationResponse.data?.data || violationResponse.data || [];
      const dqSet = new Set(
        vList.filter(v => v.violation_type === 'disqualification').map(v => Number(v.registration_id))
      );

      setRace(raceData);

      const built = (raceData?.registrations || []).map((reg, i) => {
        const ex    = resultMap.get(Number(reg.id));
        const isDq  = dqSet.has(Number(reg.id));
        return {
          registration_id: reg.id,
          lane:        reg.lane || i + 1,
          horse_name:  reg.horse?.name || 'N/A',
          jockey_name: reg.jockey?.name || reg.jockey?.user?.name || 'N/A',
          rank:        isDq ? 'DQ' : (ex?.rank ?? ''),
          finish_time: isDq ? 'DQ' : (ex?.finish_time ?? ''),
          notes:       ex?.notes || (isDq ? 'Bị truất quyền thi đấu' : ''),
          is_dq:       isDq,
          auto_filled: !!ex, // đánh dấu đã có kết quả tự động
        };
      });

      setRows(built.sort((a, b) => a.lane - b.lane));

      // Nếu đã có kết quả từ simulation
      if (existingResults.length > 0) {
        setAutoResultLoaded(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu cuộc đua.');
    } finally {
      setLoading(false);
    }
  }, [raceId]);

  useEffect(() => { fetchRaceAndResults(); }, [fetchRaceAndResults]);

  // ── Lắng nghe WebSocket — cập nhật kết quả real-time khi simulation xong ─
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus('connected');
      ws.send(JSON.stringify({ action: 'subscribe_race', race_id: Number(raceId) }));
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        // Khi simulation gửi race_finished → reload kết quả từ DB
        if (
          (data.action === 'race_finished' || data.action === 'race_result') &&
          Number(data.race_id) === Number(raceId)
        ) {
          console.log('Race finished event received, reloading results...');
          setTimeout(() => fetchRaceAndResults(), 1500); // delay 1.5s cho API lưu xong
        }
      } catch { /* ignore */ }
    };

    ws.onerror = () => setWsStatus('error');
    ws.onclose = () => setWsStatus('disconnected');

    return () => ws.close();
  }, [raceId, fetchRaceAndResults]);

  // ── Sắp xếp rows theo hạng (nếu có), nếu không thì theo làn ─────────
  const sortedRows = useMemo(() => {
    const r = [...rows];
    if (autoResultLoaded) {
      // Sắp xếp theo rank
      return r.sort((a, b) => {
        if (a.rank === 'DQ') return 1;
        if (b.rank === 'DQ') return -1;
        if (!a.rank) return 1;
        if (!b.rank) return -1;
        return Number(a.rank) - Number(b.rank);
      });
    }
    return r.sort((a, b) => Number(a.lane) - Number(b.lane));
  }, [rows, autoResultLoaded]);

  const updateRow = (registrationId, field, value) => {
    setRows(prev => prev.map(row =>
      row.registration_id === registrationId ? { ...row, [field]: value } : row
    ));
  };

  // ── Truất quyền thi đấu (DQ) một ngựa ───────────────────────────────
  const handleDQ = async (registrationId) => {
    const row = rows.find(r => r.registration_id === registrationId);
    if (!row) return;
    const confirmed = window.confirm(
      `Truất quyền thi đấu ngựa "${row.horse_name}" (Làn ${row.lane})?\nHành động này sẽ ghi nhận vi phạm DQ cho ngựa này.`
    );
    if (!confirmed) return;
    try {
      await api.post('/referee/violations', {
        race_id: Number(raceId),
        registration_id: Number(registrationId),
        violation_type: 'disqualification',
        notes: 'Truất quyền thi đấu bởi trọng tài.',
      });
      // Cập nhật local state ngay
      setRows(prev => prev.map(row =>
        row.registration_id === registrationId
          ? { ...row, is_dq: true, rank: 'DQ', finish_time: 'DQ', notes: 'Bị truất quyền thi đấu' }
          : row
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể truất quyền thi đấu. Vui lòng thử lại.');
    }
  };

  // ── Hủy truất quyền (khôi phục về trạng thái bình thường) ────────────
  const handleUndoDQ = async (registrationId) => {
    const row = rows.find(r => r.registration_id === registrationId);
    if (!row) return;
    const confirmed = window.confirm(
      `Hủy truất quyền cho ngựa "${row.horse_name}" (Làn ${row.lane})?\nDữ liệu sẽ được tải lại từ hệ thống.`
    );
    if (!confirmed) return;
    // Reload để lấy trạng thái mới nhất từ server
    await fetchRaceAndResults();
  };

  const validateRows = () => {
    if (rows.length === 0) return 'Cuộc đua này chưa có ngựa tham gia.';
    const nonDq = rows.filter(r => !r.is_dq);
    if (nonDq.some(r => !r.rank || !r.finish_time?.trim())) return 'Vui lòng nhập đầy đủ hạng và thời gian cho tất cả ngựa.';
    const ranks = nonDq.map(r => Number(r.rank));
    if (ranks.some(n => isNaN(n) || n < 1)) return 'Hạng phải là số nguyên >= 1.';
    if (new Set(ranks).size !== ranks.length) return 'Các hạng không được trùng nhau.';
    return '';
  };

  // ── Lưu kết quả thủ công (khi simulation không tự lưu được) ──────────
  const handleSave = async (e) => {
    e.preventDefault();
    const err = validateRows();
    if (err) { setError(err); return; }

    setSaving(true);
    setError('');
    try {
      await api.post(`/referee/races/${raceId}/results`, {
        results: rows.map(row => ({
          registration_id: row.registration_id,
          rank:        row.is_dq ? null : Number(row.rank),
          finish_time: row.is_dq ? null : row.finish_time,
          notes:       row.notes || null,
        })),
      });
      await fetchRaceAndResults();
      setAutoResultLoaded(true);
      setEditMode(false);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat()[0] : err.response?.data?.message || 'Không thể lưu kết quả.');
    } finally {
      setSaving(false);
    }
  };

  // ── Xác nhận chính thức (kết quả đã có, referee ký xác nhận) ─────────
  const handleConfirm = async () => {
    setConfirming(true);
    setError('');
    try {
      // Nếu chưa có kết quả → save trước
      if (!autoResultLoaded) {
        const err = validateRows();
        if (err) { setError(err); setConfirming(false); return; }
        await api.post(`/referee/races/${raceId}/results`, {
          results: rows.map(row => ({
            registration_id: row.registration_id,
            rank:        row.is_dq ? null : Number(row.rank),
            finish_time: row.is_dq ? null : row.finish_time,
            notes:       row.notes || null,
          })),
        });
      }
      // Nếu đã có kết quả → race đã finished, chỉ cần show modal
      setShowSuccessModal(true);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors).flat()[0] : err.response?.data?.message || 'Không thể xác nhận kết quả.');
    } finally {
      setConfirming(false);
    }
  };

  // ── Màu hạng ─────────────────────────────────────────────────────────
  const rankColor = (rank) => {
    if (rank === 1) return 'text-yellow-400 font-black';
    if (rank === 2) return 'text-slate-300 font-black';
    if (rank === 3) return 'text-amber-600 font-black';
    return 'text-slate-400 font-bold';
  };

  const rankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <RefereeLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link to="/referee/races" className="text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300">
              ← Quay lại danh sách cuộc đua
            </Link>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              {autoResultLoaded ? 'Kết quả cuộc đua' : 'Nhập kết quả cuộc đua'}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {autoResultLoaded
                ? 'Kết quả đã được ghi nhận tự động từ hệ thống. Kiểm tra và xác nhận chính thức bên dưới.'
                : 'Nhập thứ hạng, thời gian hoàn thành và ghi chú cho từng ngựa.'}
            </p>
          </div>

          <div className="flex flex-col gap-2 items-end">
            {race && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4 text-sm shadow-lg text-right">
                <p className="font-bold text-white">{race.name ?? race.round ?? `Cuộc đua #${race.id}`}</p>
                <p className="mt-1 text-xs text-slate-400">{race.tournament?.name}</p>
                <p className="mt-2 text-xs text-amber-400">
                  Cự ly: {race.distance}m · Trạng thái:{' '}
                  <span className={race.status === 'finished' ? 'text-emerald-400' : 'text-amber-400'}>
                    {race.status}
                  </span>
                </p>
              </div>
            )}
            {/* WS status */}
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
              wsStatus === 'connected'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              {wsStatus === 'connected' ? '● Live' : '○ Offline'}
            </span>
          </div>
        </div>

        {/* Banner kết quả tự động */}
        {autoResultLoaded && !editMode && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <span className="text-emerald-400 text-xl">🏁</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-400">Kết quả đã được ghi nhận tự động</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Hệ thống simulation đã tự động lưu kết quả. Bạn có thể xem, chỉnh sửa nếu cần, rồi xác nhận chính thức.
              </p>
            </div>
            {race?.status !== 'finished' && (
              <button
                onClick={() => setEditMode(true)}
                className="text-xs font-bold text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition"
              >
                Chỉnh sửa
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center text-slate-400">
            Đang tải dữ liệu cuộc đua...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-300">
            {error}
          </div>
        )}

        {!loading && race && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="bg-slate-950/70">
                    <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {/* View mode: Hạng | Làn | Ngựa | Jockey | Thời gian | Ghi chú | — */}
                      {/* Edit mode: Làn | Ngựa | Jockey | Hạng* | Thời gian | Ghi chú | DQ */}
                      {autoResultLoaded && !editMode ? (
                        <th className="px-4 py-4 text-center w-16">Hạng</th>
                      ) : (
                        <th className="px-4 py-4 w-16">Làn</th>
                      )}
                      {autoResultLoaded && !editMode && (
                        <th className="px-4 py-4 w-16">Làn</th>
                      )}
                      <th className="px-4 py-4">Ngựa</th>
                      <th className="px-4 py-4">Jockey</th>
                      {(!autoResultLoaded || editMode) && (
                        <th className="px-4 py-4 w-24">Hạng *</th>
                      )}
                      <th className="px-4 py-4">Thời gian</th>
                      <th className="px-4 py-4">Ghi chú</th>
                      <th className="px-4 py-4 text-center w-20">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {sortedRows.map((row) => (
                      <tr
                        key={row.registration_id}
                        className={`hover:bg-slate-800/20 transition ${row.is_dq ? 'opacity-70 bg-rose-950/20' : ''} ${
                          !row.is_dq && Number(row.rank) === 1 ? 'bg-yellow-500/5' :
                          !row.is_dq && Number(row.rank) === 2 ? 'bg-slate-400/5' :
                          !row.is_dq && Number(row.rank) === 3 ? 'bg-amber-700/5' : ''
                        }`}
                      >
                        {/* Cột 1: Hạng (view) hoặc Làn (edit) */}
                        {autoResultLoaded && !editMode ? (
                          <td className="px-4 py-4 text-center">
                            {row.is_dq ? (
                              <span className="text-rose-400 font-bold text-xs bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">DQ</span>
                            ) : row.rank ? (
                              <span className={`text-lg ${rankColor(Number(row.rank))}`}>{rankIcon(Number(row.rank))}</span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                        ) : (
                          <td className="px-4 py-4 font-bold text-amber-400">{row.lane}</td>
                        )}

                        {/* Cột Làn (chỉ view mode) */}
                        {autoResultLoaded && !editMode && (
                          <td className="px-4 py-4 text-slate-400">{row.lane}</td>
                        )}

                        {/* Ngựa */}
                        <td className="px-4 py-4 font-semibold text-white">{row.horse_name}</td>

                        {/* Jockey */}
                        <td className="px-4 py-4 text-slate-300">{row.jockey_name}</td>

                        {/* Hạng input (chỉ edit mode) */}
                        {(!autoResultLoaded || editMode) && (
                          <td className="px-4 py-4">
                            <input
                              type="text"
                              disabled={row.is_dq}
                              value={row.rank}
                              onChange={e => updateRow(row.registration_id, 'rank', e.target.value)}
                              className={`w-20 rounded-xl border px-3 py-2 text-slate-100 outline-none ${
                                row.is_dq
                                  ? 'bg-rose-950/40 border-rose-900/50 text-rose-400 font-bold text-center cursor-not-allowed'
                                  : 'bg-slate-950 border-slate-700 focus:border-amber-500'
                              }`}
                              placeholder="1"
                            />
                          </td>
                        )}

                        {/* Thời gian */}
                        <td className="px-4 py-4">
                          {autoResultLoaded && !editMode ? (
                            <span className={`font-mono font-bold ${row.is_dq ? 'text-rose-400 line-through' : 'text-indigo-400'}`}>
                              {row.finish_time || '—'}
                            </span>
                          ) : (
                            <input
                              type="text"
                              disabled={row.is_dq}
                              value={row.finish_time}
                              onChange={e => updateRow(row.registration_id, 'finish_time', e.target.value)}
                              className={`w-36 rounded-xl border px-3 py-2 text-slate-100 outline-none ${
                                row.is_dq
                                  ? 'bg-rose-950/40 border-rose-900/50 text-rose-400 font-bold text-center cursor-not-allowed'
                                  : 'bg-slate-950 border-slate-700 focus:border-amber-500'
                              }`}
                              placeholder="01:12.530"
                            />
                          )}
                        </td>

                        {/* Ghi chú */}
                        <td className="px-4 py-4">
                          {autoResultLoaded && !editMode ? (
                            <span className={`text-xs italic ${row.is_dq ? 'text-rose-400/70' : 'text-slate-500'}`}>
                              {row.notes || '—'}
                            </span>
                          ) : (
                            <input
                              type="text"
                              value={row.notes}
                              onChange={e => updateRow(row.registration_id, 'notes', e.target.value)}
                              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                              placeholder="Ghi chú tùy chọn"
                            />
                          )}
                        </td>

                        {/* Hành động: nút DQ */}
                        <td className="px-4 py-4 text-center">
                          {row.is_dq ? (
                            <button
                              type="button"
                              onClick={() => handleUndoDQ(row.registration_id)}
                              title="Hủy truất quyền"
                              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white transition"
                            >
                              Khôi phục
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDQ(row.registration_id)}
                              title="Truất quyền thi đấu"
                              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition"
                            >
                              DQ
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {sortedRows.length === 0 && (
                      <tr>
                        <td colSpan="8" className="px-4 py-10 text-center text-slate-500">
                          Cuộc đua này chưa có ngựa tham gia.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              {editMode ? (
                <>
                  <button type="button" onClick={() => { setEditMode(false); fetchRaceAndResults(); }}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800">
                    Hủy chỉnh sửa
                  </button>
                  <button type="submit" disabled={saving}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:from-amber-600 hover:to-yellow-700 disabled:opacity-60">
                    {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => navigate('/referee/races')}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800">
                    Quay lại
                  </button>
                  {race?.status !== 'finished' && (
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={confirming || sortedRows.length === 0}
                      className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60"
                    >
                      {confirming ? 'Đang xác nhận...' : '✅ Xác nhận kết quả chính thức'}
                    </button>
                  )}
                  {race?.status === 'finished' && (
                    <span className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-6 py-3 text-sm font-bold text-emerald-400">
                      ✓ Đã xác nhận chính thức
                    </span>
                  )}
                </>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
                <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Xác nhận thành công!</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Kết quả chính thức đã được xác nhận và ghi nhận vào hệ thống. Các cược liên quan đã được phân giải tự động.
              </p>
            </div>
            <div className="p-6 bg-slate-950/40 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/referee/history')}
                className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold py-3 rounded-xl text-xs transition">
                Xem lịch sử biên bản
              </button>
              <button onClick={() => { setShowSuccessModal(false); fetchRaceAndResults(); }}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition border border-slate-700/50">
                Ở lại trang này
              </button>
            </div>
          </div>
        </div>
      )}
    </RefereeLayout>
  );
};

export default ResultEntry;
