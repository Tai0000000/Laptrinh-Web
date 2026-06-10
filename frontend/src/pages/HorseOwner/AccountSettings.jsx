import React from 'react';
import HorseOwnerLayout from '../../components/HorseOwner/HorseOwnerLayout';

const AccountSettings = () => {
  return (
    <HorseOwnerLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value="John Doe" />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value="john@example.com" />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
              <input type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value="+1 (555) 123-4567" />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Location</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value="California, USA" />
            </div>
          </div>
          <button className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-8 rounded-lg transition-colors">
            Save Changes
          </button>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Security</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <div>
                <p className="font-semibold text-gray-800">Password</p>
                <p className="text-gray-600 text-sm">Last changed 3 months ago</p>
              </div>
              <button className="text-blue-500 hover:text-blue-700 font-semibold">Change</button>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <div>
                <p className="font-semibold text-gray-800">Two-Factor Authentication</p>
                <p className="text-gray-600 text-sm">Not enabled</p>
              </div>
              <button className="text-blue-500 hover:text-blue-700 font-semibold">Enable</button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input type="checkbox" id="email-notifications" className="w-4 h-4" defaultChecked />
              <label htmlFor="email-notifications" className="ml-3 text-gray-800 font-semibold">
                Email notifications for race results
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="horse-updates" className="w-4 h-4" defaultChecked />
              <label htmlFor="horse-updates" className="ml-3 text-gray-800 font-semibold">
                Updates about your horses
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="tournament-alerts" className="w-4 h-4" defaultChecked />
              <label htmlFor="tournament-alerts" className="ml-3 text-gray-800 font-semibold">
                Tournament and race alerts
              </label>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-lg border-2 border-red-200 shadow p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Danger Zone</h2>
          <button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </HorseOwnerLayout>
  );
};

export default AccountSettings;
