import { useState, useEffect } from "react";
import api from "../../api/axios";
import HorseOwnerLayout from "../../components/HorseOwner/HorseOwnerLayout";
import SuccessModal from "../../components/SuccessModal";
import ConfirmModal from "../../components/ConfirmModal";

/* ── modal thuê nài ngựa ── */
function HireModal({ jockey, horses, onClose, onSuccess }) {
  const [horseId, setHorseId] = useState("");
  const [raceId, setRaceId] = useState("");
  const [races, setRaces] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/public/races")
      .then((r) => setRaces(r.data?.data ?? []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!horseId || !raceId) {
      setError("Vui lòng chọn ngựa và cuộc đua.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post(`/horses/${horseId}/hire-jockey`, {
        jockey_id: jockey.id,
        race_id: raceId,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Không thể gửi lời mời.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Thuê nài ngựa</h2>
        <p className="text-gray-500 text-sm mb-6">
          Gửi lời mời tới <strong>{jockey.name}</strong>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Chọn ngựa
            </label>
            <select
              value={horseId}
              onChange={(e) => setHorseId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn ngựa --</option>
              {horses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Cuộc đua
            </label>
            <select
              value={raceId}
              onChange={(e) => setRaceId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn cuộc đua --</option>
              {races.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name ?? r.round ?? `Cuộc đua #${r.id}`}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? "Đang gửi..." : "Gửi lời mời"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const MyJockeys = () => {
  const [jockeys, setJockeys] = useState([]);
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hiring, setHiring] = useState(null); // jockey đang được hire
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    Promise.all([api.get("/jockeys"), api.get("/horse-owner/horses")])
      .then(([jRes, hRes]) => {
        setJockeys(jRes.data?.data ?? []);
        setHorses(hRes.data?.data ?? hRes.data ?? []);
      })
      .catch(() => setError("Không thể tải danh sách nài ngựa."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <HorseOwnerLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Nài ngựa</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Danh sách nài ngựa có thể thuê
            </p>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">
            ✅ {toast}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-center">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    "Tên nài ngựa",
                    "Kinh nghiệm",
                    "Số trận thắng",
                    "Tổng trận",
                    "Giấy phép",
                    "Hành động",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jockeys.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-400 text-sm"
                    >
                      Chưa có nài ngựa nào trong hệ thống
                    </td>
                  </tr>
                ) : (
                  jockeys.map((j) => (
                    <tr
                      key={j.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">
                            {j.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {j.name}
                            </p>
                            <p className="text-gray-400 text-xs">{j.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {j.experience_years ? `${j.experience_years} năm` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-green-600 text-sm">
                          {j.wins ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {j.total_races ?? 0}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                        {j.license_number ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setHiring(j)}
                          className="bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold py-1.5 px-4 rounded-lg transition-colors"
                        >
                          Thuê
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hiring && (
        <HireModal
          jockey={hiring}
          horses={horses}
          onClose={() => setHiring(null)}
          onSuccess={() => {
            setHiring(null);
            showToast(`Đã gửi lời mời tới ${hiring.name}!`);
          }}
        />
      )}
    </HorseOwnerLayout>
  );
};

export default MyJockeys;
