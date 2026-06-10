import React from 'react';
import HorseOwnerLayout from '../../components/HorseOwner/HorseOwnerLayout';

const MyJockeys = () => {
  const jockeys = [
    { id: 1, name: 'John Smith', experience: '10 years', wins: 45, status: 'Active' },
    { id: 2, name: 'Sarah Johnson', experience: '8 years', wins: 38, status: 'Active' },
    { id: 3, name: 'Mike Davis', experience: '5 years', wins: 22, status: 'Inactive' },
  ];

  return (
    <HorseOwnerLayout>
      <div className="max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">My Jockeys</h1>
            <p className="text-gray-600 mt-2">Manage your jockey team</p>
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
            + Hire Jockey
          </button>
        </div>

        {/* Jockeys Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Experience</th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Total Wins</th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jockeys.map((jockey) => (
                <tr key={jockey.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-800">{jockey.name}</td>
                  <td className="px-6 py-4 text-gray-700">{jockey.experience}</td>
                  <td className="px-6 py-4 text-gray-700">{jockey.wins}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      jockey.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {jockey.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-500 hover:text-blue-700 mr-4">Edit</button>
                    <button className="text-red-500 hover:text-red-700">Remove</button>
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

export default MyJockeys;
