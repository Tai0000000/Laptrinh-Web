import React from 'react';
import HorseOwnerLayout from '../../components/HorseOwner/HorseOwnerLayout';

const ResultsRewards = () => {
  const results = [
    { id: 1, horseName: 'Lightning', race: 'Classic Derby', date: '2026-05-28', position: '1st', prize: '$5,000' },
    { id: 2, horseName: 'Thunder King', race: 'Regional Sprint', date: '2026-05-25', position: '2nd', prize: '$2,500' },
    { id: 3, horseName: 'Storm', race: 'Summer Cup', date: '2026-05-20', position: '1st', prize: '$3,500' },
    { id: 4, horseName: 'Lightning', race: 'Quick Challenge', date: '2026-05-15', position: '3rd', prize: '$1,000' },
  ];

  return (
    <HorseOwnerLayout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Results & Rewards</h1>
          <p className="text-gray-600 mt-2">Your horses' race results and winnings</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Total Races</p>
            <p className="text-3xl font-bold text-gray-800">{results.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">1st Place Finishes</p>
            <p className="text-3xl font-bold text-gray-800">2</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Total Winnings</p>
            <p className="text-3xl font-bold text-green-600">$12,000</p>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Horse Name</th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Race Name</th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Date</th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Position</th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Prize</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-800">{result.horseName}</td>
                  <td className="px-6 py-4 text-gray-700">{result.race}</td>
                  <td className="px-6 py-4 text-gray-700">{result.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      result.position === '1st' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {result.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600">{result.prize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </HorseOwnerLayout>
  );
};

export default ResultsRewards;
