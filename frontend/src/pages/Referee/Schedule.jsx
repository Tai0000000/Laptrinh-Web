import React from 'react';
import RefereeLayout from '../../components/RefereeLayout';

const Schedule = () => {
  const scheduleDays = [
    {
      date: 'Today - Saturday, June 6, 2026',
      races: [
        { time: '14:30', name: 'Grand Prix Final', status: 'completed', distance: '1200m', track: 'Main Track A', role: 'Track Judge' },
        { time: '16:00', name: 'Spring Sprint Cup - Heat A', status: 'completed', distance: '1000m', track: 'Inner Circle B', role: 'Start Judge' },
        { time: '17:15', name: 'Spring Sprint Cup - Heat B', status: 'pending', distance: '1000m', track: 'Inner Circle B', role: 'Start Judge' },
        { time: '19:00', name: 'Sunset Classic Derby', status: 'pending', distance: '1600m', track: 'Main Track A', role: 'Chief Referee' },
      ]
    },
    {
      date: 'Tomorrow - Sunday, June 7, 2026',
      races: [
        { time: '10:00', name: 'Youth Sprint Championship', status: 'pending', distance: '800m', track: 'Main Track A', role: 'Finish Judge' },
        { time: '15:30', name: 'Royal Gold Cup', status: 'pending', distance: '2000m', track: 'Main Track A', role: 'Chief Referee' },
      ]
    }
  ];

  return (
    <RefereeLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-400 bg-clip-text text-transparent">
            My Assignment Schedule
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            View your referee roster, assigned roles, and race tracks for current and upcoming events.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-8 max-w-4xl">
          {scheduleDays.map((day, dIdx) => (
            <div key={dIdx} className="space-y-4">
              <h3 className="text-sm font-bold text-amber-500 bg-amber-500/5 border border-amber-500/10 rounded-lg px-4 py-2 self-start inline-block tracking-wider uppercase">
                {day.date}
              </h3>

              <div className="border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
                {day.races.map((race, rIdx) => (
                  <div key={rIdx} className="relative bg-slate-900/30 border border-slate-800/80 hover:border-slate-700/60 p-5 rounded-2xl backdrop-blur-sm transition duration-300 group">
                    {/* Time marker indicator */}
                    <span className="absolute -left-[35px] top-6 w-4.5 h-4.5 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center group-hover:border-amber-500 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-amber-400"></span>
                    </span>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-bold text-white bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                            {race.time}
                          </span>
                          <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors duration-200">
                            {race.name}
                          </h4>
                        </div>
                        <p className="text-slate-400 text-xs mt-1">
                          Role: <span className="text-amber-400/90 font-semibold">{race.role}</span> • Track: {race.track} • Distance: {race.distance}
                        </p>
                      </div>

                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider self-start sm:self-auto ${
                        race.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                      }`}>
                        {race.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </RefereeLayout>
  );
};

export default Schedule;
