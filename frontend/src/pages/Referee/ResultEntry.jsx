import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RefereeLayout from '../../components/RefereeLayout';
import api from '../../api/axios';

const ResultEntry = () => {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const [race, setRace] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRaceAndResults();
  }, [raceId]);

  const fetchRaceAndResults = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const [raceResponse, resultResponse] = await Promise.all([
        api.get(`/referee/races/${raceId}`),
        api.get(`/referee/races/${raceId}/results`).catch(() => ({ data: { data: [] } })),
      ]);

      const raceData = raceResponse.data?.data;
      const existingResults = resultResponse.data?.data || [];
      const resultByRegistration = new Map(
        existingResults.map((result) => [Number(result.registration_id), result])
      );

      setRace(raceData);
      setRows((raceData?.registrations || []).map((registration, index) => {
        const existing = resultByRegistration.get(Number(registration.id));

        return {
          registration_id: registration.id,
          lane: registration.lane || index + 1,
          horse_name: registration.horse?.name || 'N/A',
          jockey_name: registration.jockey?.name || registration.jockey?.user?.name || 'N/A',
          rank: existing?.rank || '',
          finish_time: existing?.finish_time || '',
          notes: existing?.notes || '',
        };
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu cuộc đua.');
    } finally {
      setLoading(false);
    }
  };

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => Number(a.lane) - Number(b.lane));
  }, [rows]);

  const updateRow = (registrationId, field, value) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.registration_id === registrationId ? { ...row, [field]: value } : row
      )
    );
  };

  const validateRows = () => {
    if (rows.length === 0) {
      return 'Cuộc đua này chưa có ngựa tham gia.';
    }

    const ranks = rows.map((row) => Number(row.rank));
    const hasEmpty = rows.some((row) => !row.rank || !row.finish_time.trim());
    const hasInvalidRank = ranks.some((rank) => Number.isNaN(rank) || rank < 1);
    const uniqueRanks = new Set(ranks);

    if (hasEmpty) return 'Vui lòng nhập đầy đủ hạng và thời gian về đích.';
    if (hasInvalidRank) return 'Hạng về đích phải là số nguyên lớn hơn 0.';
    if (uniqueRanks.size !== ranks.length) return 'Mỗi ngựa phải có một hạng riêng, không được trùng.';

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateRows();

    if (validationError) {
      setError(validationError);
      setSuccess('');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await api.post(`/referee/races/${raceId}/results`, {
        results: rows.map((row) => ({
          registration_id: row.registration_id,
          rank: Number(row.rank),
          finish_time: row.finish_time,
          notes: row.notes || null,
        })),
      });

      setSuccess('Đã lưu kết quả cuộc đua. Admin có thể kiểm tra và công bố kết quả chính thức.');
      await fetchRaceAndResults();
    } catch (err) {
      const errors = err.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()[0] : null;
      setError(firstError || err.response?.data?.message || 'Không thể lưu kết quả cuộc đua.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RefereeLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link to="/referee/races" className="text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300">
              ← Quay lại danh sách cuộc đua
            </Link>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Nhập kết quả cuộc đua
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Nhập thứ hạng, thời gian hoàn thành và ghi chú cho từng ngựa. Kết quả sau khi lưu sẽ chuyển sang trạng thái hoàn thành.
            </p>
          </div>

          {race && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4 text-sm shadow-lg">
              <p className="font-bold text-white">{race.name}</p>
              <p className="mt-1 text-xs text-slate-400">{race.tournament?.name || 'Không xác định giải đấu'}</p>
              <p className="mt-2 text-xs text-amber-400">Cự ly: {race.distance}m · Trạng thái: {race.status}</p>
            </div>
          )}
        </div>

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

        {!loading && success && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-300">
            {success}
          </div>
        )}

        {!loading && race && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-sm">
                  <thead className="bg-slate-950/70">
                    <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-4">Làn</th>
                      <th className="px-4 py-4">Ngựa</th>
                      <th className="px-4 py-4">Jockey</th>
                      <th className="px-4 py-4">Hạng</th>
                      <th className="px-4 py-4">Thời gian</th>
                      <th className="px-4 py-4">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {sortedRows.map((row) => (
                      <tr key={row.registration_id} className="hover:bg-slate-800/20">
                        <td className="px-4 py-4 font-bold text-amber-400">{row.lane}</td>
                        <td className="px-4 py-4 font-semibold text-white">{row.horse_name}</td>
                        <td className="px-4 py-4 text-slate-300">{row.jockey_name}</td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            min="1"
                            value={row.rank}
                            onChange={(event) => updateRow(row.registration_id, 'rank', event.target.value)}
                            className="w-24 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                            placeholder="1"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="text"
                            value={row.finish_time}
                            onChange={(event) => updateRow(row.registration_id, 'finish_time', event.target.value)}
                            className="w-36 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                            placeholder="01:12.530"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="text"
                            value={row.notes}
                            onChange={(event) => updateRow(row.registration_id, 'notes', event.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                            placeholder="Ghi chú tùy chọn"
                          />
                        </td>
                      </tr>
                    ))}

                    {sortedRows.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-4 py-10 text-center text-slate-500">
                          Cuộc đua này chưa có ngựa tham gia.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate('/referee/races')}
                className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving || sortedRows.length === 0}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/10 transition hover:from-amber-600 hover:to-yellow-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu kết quả'}
              </button>
            </div>
          </form>
        )}
      </div>
    </RefereeLayout>
  );
};

export default ResultEntry;
