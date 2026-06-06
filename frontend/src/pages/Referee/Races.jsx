import React, { useState } from 'react';
import RefereeLayout from '../../components/RefereeLayout';

const Races = () => {
  const [filter, setFilter] = useState('all');

  const racesData = [
    { id: 101, tournament: 'Spring Championship 2026', time: '14:30', name: 'Grand Prix Final', status: 'completed', distance: '1200m', horses: 8 },
    { id: 102, tournament: 'Spring Championship 2026', time: '16:00', name: 'Spring Sprint Cup - Heat A', status: 'active', distance: '1000m', horses: 6 },
    { id: 103, tournament: 'Spring Championship 2026', time: '17:15', name: 'Spring Sprint Cup - Heat B', status: 'scheduled', distance: '1000m', horses: 6 },
    { id: 104, tournament: 'Royal Derby League', time: '19:00', name: 'Sunset Classic Derby', status: 'scheduled', distance: '1600m', horses: 10 },
    { id: 105, tournament: 'Royal Derby League', time: 'Tomorrow', name: 'Royal Gold Cup', status: 'scheduled', distance: '2000m', horses: 12 },
  ];

  const filteredRaces = filter === 'all' 
    ? racesData 
    : racesData.filter(r => r.status === filter);

  return (
    <RefereeLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-400 bg-clip-text text-transparent">
            Assigned Races
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Monitor and record results for your assigned races. Select a race to manage checklists and positions.
          </p>
        </div>

        {/* Filters & Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl backdrop-blur-md">
          <div className="flex space-x-2">
            {['all', 'scheduled', 'active', 'completed'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  filter === type
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search races..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
            />
          </div>
        </div>

        {/* Races Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRaces.map((race) => (
            <div 
              key={race.id} 
              className="bg-slate-900/30 border border-slate-800/80 hover:border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm group shadow-lg"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-amber-500 bg-amber-500/5 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                    ID: #{race.id}
                  </span>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    race.status === 'completed' 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                      : race.status === 'active'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                  }`}>
                    {race.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors duration-250">
                    {race.name}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">{race.tournament}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Time</span>
                    <span className="text-slate-300 font-semibold mt-0.5 block">{race.time}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Distance</span>
                    <span className="text-slate-300 font-semibold mt-0.5 block">{race.distance}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Horses</span>
                    <span className="text-slate-300 font-semibold mt-0.5 block">{race.horses} lanes</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 flex space-x-2">
                {race.status === 'completed' ? (
                  <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs transition duration-200 border border-slate-700/50">
                    View Reports
                  </button>
                ) : race.status === 'active' ? (
                  <>
                    <button className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all duration-300">
                      Record Finish
                    </button>
                    <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold p-2.5 rounded-xl border border-slate-700/50 transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                    </button>
                  </>
                ) : (
                  <button className="w-full bg-slate-800/80 hover:bg-slate-800 text-amber-400 border border-slate-850 hover:border-slate-700/50 font-bold py-2.5 px-4 rounded-xl text-xs transition duration-200">
                    Pre-Race Checklist
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </RefereeLayout>
  );
};

export default Races;
