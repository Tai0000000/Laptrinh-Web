import React, { useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

const LiveLeaderboard = ({ raceId }) => {
  const { raceData, subscribeToRace, unsubscribeFromRace, isConnected } = useSocket();

  useEffect(() => {
    if (raceId) {
      subscribeToRace(raceId);
      return () => unsubscribeFromRace(raceId);
    }
  }, [raceId, subscribeToRace, unsubscribeFromRace]);

  const currentRace = raceData[raceId] || { horses: [] };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
        <h3 className="text-white font-bold text-lg flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </span>
          Bảng Xếp Hạng Trực Tiếp
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-semibold uppercase animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            Live
          </span>
        </h3>
        <span className="text-slate-400 text-sm">Race ID: #{raceId}</span>
      </div>

      <div className="p-6">
        {!isConnected ? (
          <div className="text-center py-8 text-gray-500">Đang kết nối tới máy chủ...</div>
        ) : currentRace.horses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Đang chờ dữ liệu cuộc đua...</div>
        ) : (
          <div className="space-y-4">
            {currentRace.horses
              .sort((a, b) => a.position - b.position)
              .map((horse, index) => (
                <div 
                  key={horse.id} 
                  className={`flex items-center p-4 rounded-xl transition-all ${
                    index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                    index === 1 ? 'bg-slate-300 text-slate-700' : 
                    index === 2 ? 'bg-orange-300 text-orange-800' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {horse.position}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{horse.name}</h4>
                    <p className="text-xs text-gray-500 italic">Nài ngựa: {horse.jockey}</p>
                  </div>

                  <div className="text-right mr-4">
                    <div className="text-sm font-mono font-bold text-indigo-600">{horse.speed} km/h</div>
                    <div className="text-xs text-gray-400">Vị trí: {horse.position} / {currentRace.horses.length}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-emerald-600">{horse.distance_covered || 0}m</div>
                    <div className="text-xs text-gray-400">Cách đích: {horse.distance_left}m</div>
                  </div>

                  {/* Thanh tiến trình mini */}
                  <div className="ml-4 w-24 h-2 bg-gray-200 rounded-full overflow-hidden hidden sm:block">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-500" 
                      style={{ width: `${100 - (horse.distance_left / (currentRace.total_distance || 1000) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveLeaderboard;
