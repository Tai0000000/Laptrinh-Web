import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HorseOwnerLayout from '../../components/HorseOwnerLayout';

const MyHorses = () => {
  const navigate = useNavigate();
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/owners/10/horses')
      .then((response) => {
        setHorses(response.data.data || response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching horses:', err);
        setError('Failed to fetch horses data.');
        setLoading(false);
      });
  }, []);

  return (
    <HorseOwnerLayout>
      <div className="max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">My Horses</h1>
            <p className="text-gray-600 mt-2">Manage your horses collection</p>
          </div>
          <button
            onClick={() => navigate('/horse-owner/horses/new')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            + Add New Horse
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-600 font-semibold">Loading horses...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600 font-semibold">{error}</div>
        ) : (
          /* Horses Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Breed</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Age</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {horses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No horses found. Add your first horse!
                    </td>
                  </tr>
                ) : (
                  horses.map((horse) => (
                    <tr key={horse.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-800">{horse.name}</td>
                      <td className="px-6 py-4 text-gray-700">{horse.breed}</td>
                      <td className="px-6 py-4 text-gray-700">{horse.age} years</td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                          {horse.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-500 hover:text-blue-700 mr-4">Edit</button>
                        <button className="text-red-500 hover:text-red-700">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </HorseOwnerLayout>
  );
};

export default MyHorses;
