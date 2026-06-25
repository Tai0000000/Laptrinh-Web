import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import PredictionHistory from '../components/PredictionHistory';

const Predictions = () => {
  const [races, setRaces] = useState([
    { id: 101, name: "Vòng loại Bảng A - Sprint", time: "2026-06-15 14:30:00", status: "scheduled", tournament: "Grand Royal Derby 2026" },
    { id: 102, name: "Vòng loại Bảng B - Long Distance", time: "2026-06-15 16:00:00", status: "scheduled", tournament: "Grand Royal Derby 2026" },
    { id: 103, name: "Chung kết Cup Mùa Hè", time: "2026-07-01 15:45:00", status: "scheduled", tournament: "Summer Sprint Cup" },
  ]);

  const [selectedRace, setSelectedRace] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [prediction, setPrediction] = useState({
    amount: 10,
    type: 'win' // win, place, show
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    if (selectedRace) {
      const mockParticipants = [
        { id: 1, horse_name: "Thần Gió", jockey_name: "Nguyễn Văn An", lane: 1, odds: 2.5 },
        { id: 2, horse_name: "Xích Thố", jockey_name: "Lê Minh Tâm", lane: 2, odds: 3.0 },
        { id: 3, horse_name: "Bạch Mã", jockey_name: "Trần Hữu Phước", lane: 3, odds: 4.5 },
        { id: 4, horse_name: "Hắc Long", jockey_name: "Phạm Quốc Bảo", lane: 4, odds: 1.8 },
      ];
      setParticipants(mockParticipants);
      setSelectedHorse(null);
      setMessage({ text: '', type: '' });
    }
  }, [selectedRace]);

  useEffect(() => {
    // Lấy lịch sử dự đoán
    api.get('/bets')
      .then(res => {
        // Nếu backend trả về dữ liệu mẫu (Stub)
        if (res.data.data.length === 0) {
          const mockPredictions = [
            { id: 1, race_name: "Vòng loại Bảng A - Sprint", tournament_name: "Grand Royal Derby 2026", horse_name: "Thần Gió", lane: 1, prediction_type: "win", status: "won", payout: 25.0 },
            { id: 2, race_name: "Vòng loại Bảng B", tournament_name: "Grand Royal Derby 2026", horse_name: "Xích Thố", lane: 2, prediction_type: "place", status: "lost", payout: 0 },
            { id: 3, race_name: "Chung kết Cup Mùa Hè", tournament_name: "Summer Sprint Cup", horse_name: "Bạch Mã", lane: 3, prediction_type: "show", status: "pending", payout: 0 },
          ];
          setPredictions(mockPredictions);
        } else {
          setPredictions(res.data.data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const fetchPredictions = () => {
    api.get('/bets')
      .then(res => {
        if (res.data.data.length === 0) {
          const mockPredictions = [
            { id: 1, race_name: "Vòng loại Bảng A - Sprint", tournament_name: "Grand Royal Derby 2026", horse_name: "Thần Gió", lane: 1, prediction_type: "win", status: "won", payout: 25.0 },
            { id: 2, race_name: "Vòng loại Bảng B", tournament_name: "Grand Royal Derby 2026", horse_name: "Xích Thố", lane: 2, prediction_type: "place", status: "lost", payout: 0 },
            { id: 3, race_name: "Chung kết Cup Mùa Hè", tournament_name: "Summer Sprint Cup", horse_name: "Bạch Mã", lane: 3, prediction_type: "show", status: "pending", payout: 0 },
          ];
          setPredictions(mockPredictions);
        } else {
          setPredictions(res.data.data);
        }
      })
      .catch(err => console.error(err));
  };

  const handleBetSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRace || !selectedHorse) {
      setMessage({ text: 'Vui lòng chọn cuộc đua và ngựa!', type: 'error' });
      return;
    }
    const raceTime = new Date(selectedRace.time).getTime();
    const now = new Date().getTime();
    if (now >= raceTime) {
      setMessage({ text: 'Cuộc đua đã bắt đầu hoặc kết thúc. Không thể đặt cược!', type: 'error' });
      return;
    }
    try {
      await api.post(`/races/${selectedRace.id}/bet`, {
        registration_id: selectedHorse.id,
        amount: prediction.amount,
        prediction_type: prediction.type
      });
      setMessage({ text: 'Đặt dự đoán thành công! Chúc bạn may mắn.', type: 'success' });
      fetchPredictions(); // Refresh predictions after successful bet
    } catch (err) {
      setMessage({ text: 'Có lỗi xảy ra khi gửi dự đoán.', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Sàn Dự Đoán Kết Quả</h1>
        <p className="text-lg text-slate-600">Chọn cuộc đua, phân tích chiến mã và đưa ra dự đoán của bạn.</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center mr-3 text-sm">01</span>
            Chọn Cuộc Đua
          </h2>
          <div className="space-y-3">
            {races.map((race) => (
              <button
                key={race.id}
                onClick={() => setSelectedRace(race)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                  selectedRace?.id === race.id 
                  ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-600/10' 
                  : 'border-gray-100 bg-white hover:border-indigo-200'
                }`}
              >
                <p className="text-[10px] font-black text-indigo-500 uppercase mb-1">{race.tournament}</p>
                <h3 className="font-bold text-slate-900">{race.name}</h3>
                <p className="text-xs text-slate-500 mt-2 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(race.time).toLocaleString('vi-VN')}
                </p>
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 space-y-8">
          {selectedRace ? (
            <>
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center mr-3 text-sm">02</span>
                  Danh Sách Chiến Mã
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {participants.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => setSelectedHorse(p)}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                        selectedHorse?.id === p.id 
                        ? 'border-indigo-600 bg-indigo-50' 
                        : 'border-gray-50 bg-slate-50 hover:bg-white hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold mr-4">
                          {p.lane}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{p.horse_name}</h4>
                          <p className="text-xs text-slate-500">{p.jockey_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Tỷ lệ</p>
                        <p className="text-sm font-black text-indigo-600">x{p.odds}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {selectedHorse && (
                <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-xl font-bold mb-8 flex items-center">
                    <span className="w-8 h-8 bg-white text-slate-900 rounded-lg flex items-center justify-center mr-3 text-sm">03</span>
                    Xác Nhận Dự Đoán
                  </h2>
                  <form onSubmit={handleBetSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Loại dự đoán</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['win', 'place', 'show'].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setPrediction({...prediction, type: t})}
                              className={`py-3 rounded-xl font-bold text-sm uppercase transition-all ${
                                prediction.type === t 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                              }`}
                            >
                              {t === 'win' ? 'Thắng' : t === 'place' ? 'Top 2' : 'Top 3'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Số tiền cược ($)</label>
                        <input
                          type="number"
                          value={prediction.amount}
                          onChange={(e) => setPrediction({...prediction, amount: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center">
                        <div className="mr-4">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dự đoán cho</p>
                          <p className="text-lg font-black">{selectedHorse.horse_name}</p>
                        </div>
                        <div className="h-10 w-px bg-white/10 mx-4 hidden md:block"></div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tiền thưởng dự kiến</p>
                          <p className="text-lg font-black text-green-400">${(prediction.amount * selectedHorse.odds).toFixed(2)}</p>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-full font-black shadow-xl transition-all hover:-translate-y-1 active:scale-95"
                      >
                        GỬI DỰ ĐOÁN
                      </button>
                    </div>
                    {message.text && (
                      <div className={`p-4 rounded-xl text-center font-bold text-sm ${
                        message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {message.text}
                      </div>
                    )}
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-gray-200 text-slate-400">
              <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="font-medium text-lg">Vui lòng chọn một cuộc đua từ danh sách bên trái để bắt đầu.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lịch sử dự đoán */}
      <PredictionHistory predictions={predictions} />
    </div>
  );
};

export default Predictions;
