import React, { useState } from 'react';
import RefereeLayout from '../../components/RefereeLayout';

const Violations = () => {
  const [selectedRace, setSelectedRace] = useState('');
  const [selectedHorse, setSelectedHorse] = useState('');
  const [violationType, setViolationType] = useState('');
  const [notes, setNotes] = useState('');

  const recentViolations = [
    { id: 1, race: 'Spring Sprint Cup - Heat A', target: 'Thunder King (Jockey: John Smith)', type: 'False Start', date: 'Today, 16:05', status: 'Approved' },
    { id: 2, race: 'Grand Prix Final', target: 'Midnight Run (Jockey: Bruce Wayne)', type: 'Lane Infraction', date: 'Today, 14:42', status: 'Approved' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Violation logged successfully (Stub)');
    setSelectedRace('');
    setSelectedHorse('');
    setViolationType('');
    setNotes('');
  };

  return (
    <RefereeLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-400 bg-clip-text text-transparent">
            Violation Log
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Report rule infractions, lane deviations, or jockey conduct issues during a race.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-lg space-y-6">
            <h2 className="text-lg font-bold text-white tracking-wide border-b border-slate-800 pb-3">Log New Violation</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Race</label>
                <select
                  value={selectedRace}
                  onChange={(e) => setSelectedRace(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-amber-500 transition"
                >
                  <option value="">-- Choose Active Race --</option>
                  <option value="102">Spring Sprint Cup - Heat A</option>
                  <option value="103">Spring Sprint Cup - Heat B</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Horse & Jockey</label>
                <select
                  value={selectedHorse}
                  onChange={(e) => setSelectedHorse(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-amber-500 transition"
                >
                  <option value="">-- Choose Horse/Lanes --</option>
                  <option value="horse1">Lane 2: Thunder King (Jockey: John Smith)</option>
                  <option value="horse2">Lane 4: Firestorm (Jockey: Arthur Pendragon)</option>
                  <option value="horse3">Lane 5: Golden Legend (Jockey: Robin Hood)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Violation Type</label>
                <select
                  value={violationType}
                  onChange={(e) => setViolationType(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-amber-500 transition"
                >
                  <option value="">-- Select Type --</option>
                  <option value="false_start">False Start</option>
                  <option value="lane_deviation">Lane Infraction (Crossing lanes)</option>
                  <option value="jockey_conduct">Unprofessional Jockey Conduct</option>
                  <option value="equipment_violation">Equipment Compliance Failure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Incident Description</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  placeholder="Enter details, time stamp, or track location..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-amber-500 transition placeholder-slate-600 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all duration-300 shadow-md shadow-amber-500/10 active:scale-[0.98]"
              >
                Log Infraction
              </button>
            </form>
          </div>

          {/* List of Recent Violations */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-lg space-y-6">
            <h2 className="text-lg font-bold text-white tracking-wide border-b border-slate-800 pb-3">Recorded Violations</h2>

            <div className="space-y-4">
              {recentViolations.map((v) => (
                <div key={v.id} className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl flex justify-between items-center hover:bg-slate-900/30 transition duration-300">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]"></span>
                      <h4 className="text-sm font-bold text-white">{v.type}</h4>
                    </div>
                    <p className="text-xs text-slate-300">{v.target}</p>
                    <p className="text-[10px] text-slate-500">{v.race} • {v.date}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/5 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RefereeLayout>
  );
};

export default Violations;
