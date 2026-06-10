import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HorseOwnerLayout from '../../components/HorseOwner/HorseOwnerLayout';
import AddNewHorseModal from '../../components/HorseOwner/AddNewHorseModal';


const Dashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    navigate('/horse-owner/horses');
  };

  return (
    <HorseOwnerLayout>
      <div className="max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome to your Horse Owner Dashboard</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Total Horses</p>
            <p className="text-3xl font-bold text-gray-800">12</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Active Jockeys</p>
            <p className="text-3xl font-bold text-gray-800">5</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm">Upcoming Races</p>
            <p className="text-3xl font-bold text-gray-800">3</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Total Winnings</p>
            <p className="text-3xl font-bold text-gray-800">$45,230</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-200">
                <p className="text-gray-800 font-semibold">Horse "Thunder King" registered for race</p>
                <p className="text-gray-500 text-sm">June 2, 2026</p>
              </div>
              <div className="pb-4 border-b border-gray-200">
                <p className="text-gray-800 font-semibold">New jockey "John Smith" added</p>
                <p className="text-gray-500 text-sm">June 1, 2026</p>
              </div>
              <div>
                <p className="text-gray-800 font-semibold">"Lightning" won race with $5,000 winnings</p>
                <p className="text-gray-500 text-sm">May 31, 2026</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors">
                Add New Horse
              </button>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors">
                Register for Race
              </button>
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded transition-colors">
                Hire Jockey
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Horse Modal */}
      <AddNewHorseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess} 
      />
    </HorseOwnerLayout>
  );
};

export default Dashboard;
