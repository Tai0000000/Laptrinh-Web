import React from 'react';
import HorseOwnerLayout from '../../components/HorseOwnerLayout';

const RaceRegistrations = () => {
  const registrations = [
    { id: 1, horseName: 'Thunder King', race: 'Summer Championship', date: '2026-06-15', status: 'Confirmed' },
    { id: 2, horseName: 'Lightning', race: 'Classic Derby', date: '2026-06-20', status: 'Pending' },
    { id: 3, horseName: 'Storm', race: 'Regional Sprint', date: '2026-06-25', status: 'Confirmed' },
  ];

  return (
    <HorseOwnerLayout>
      <div className="max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Race Registrations</h1>
            <p className="text-gray-600 mt-2">Register your horses for upcoming races</p>
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
            + Register for Race
          </button>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Horse Name</th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Race Name</th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Race Date</th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-800">{reg.horseName}</td>
                  <td className="px-6 py-4 text-gray-700">{reg.race}</td>
                  <td className="px-6 py-4 text-gray-700">{reg.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      reg.status === 'Confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-500 hover:text-blue-700 mr-4">View</button>
                    <button className="text-red-500 hover:text-red-700">Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </HorseOwnerLayout>
  );
};

export default RaceRegistrations;
