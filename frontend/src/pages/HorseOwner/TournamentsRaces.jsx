import React from 'react';
import HorseOwnerLayout from '../../components/HorseOwnerLayout';

const TournamentsRaces = () => {
  const tournaments = [
    { id: 1, name: 'Summer Championship 2026', startDate: '2026-06-15', endDate: '2026-06-30', status: 'Upcoming', prizes: '$100,000' },
    { id: 2, name: 'Classic Derby', startDate: '2026-07-10', endDate: '2026-07-15', status: 'Upcoming', prizes: '$75,000' },
    { id: 3, name: 'Spring Festival', startDate: '2026-05-01', endDate: '2026-05-30', status: 'Completed', prizes: '$50,000' },
  ];

  return (
    <HorseOwnerLayout>
      <div className="max-w-7xl">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Tournaments & Races</h1>
          <p className="text-gray-600 mb-8">Available tournaments and races</p>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">{tournament.name}</h2>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  tournament.status === 'Upcoming' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {tournament.status}
                </span>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <p className="text-gray-500 text-sm">Start Date</p>
                  <p className="font-semibold text-gray-800">{tournament.startDate}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">End Date</p>
                  <p className="font-semibold text-gray-800">{tournament.endDate}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Prize Pool</p>
                  <p className="font-bold text-green-600 text-lg">{tournament.prizes}</p>
                </div>
              </div>

              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </HorseOwnerLayout>
  );
};

export default TournamentsRaces;
