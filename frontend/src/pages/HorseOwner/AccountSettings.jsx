import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HorseOwnerLayout from '../../components/HorseOwner/HorseOwnerLayout';
import SuccessModal from '../../components/SuccessModal';

const AccountSettings = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ show: false, title: '', msg: '' });

  useEffect(() => {
    axios.get('http://localhost:8000/api/owners/10')
      .then((response) => {
        const data = response.data.data || response.data;
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: '+1 (555) 123-4567', // Static placeholder as not in DB
          location: 'California, USA', // Static placeholder as not in DB
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching owner profile:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setSaving(true);
    axios.put('http://localhost:8000/api/owners/10', {
      name: formData.name,
      email: formData.email
    })
    .then((response) => {
      const data = response.data.data || response.data;
      setFormData(prev => ({
        ...prev,
        name: data.name || '',
        email: data.email || '',
      }));
      setSuccessMessage({
        show: true,
        title: 'Profile Updated',
        msg: 'Your profile details have been saved successfully!'
      });
    })
    .catch((err) => {
      console.error('Error updating owner profile:', err);
      alert(err.response?.data?.message || 'Failed to update profile. Please try again.');
    })
    .finally(() => {
      setSaving(false);
    });
  };

  return (
    <HorseOwnerLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600 font-semibold">
            Loading profile information...
          </div>
        ) : (
          <>
            {/* Profile Section */}
            <div className="bg-white rounded-lg shadow p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Location</label>
                  <input 
                    type="text" 
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-8 rounded-lg transition-colors shadow-md disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
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
          </>
        )}
      </div>

      {/* Success Notification Modal */}
      <SuccessModal 
        isOpen={successMessage.show} 
        title={successMessage.title}
        message={successMessage.msg}
        onClose={() => setSuccessMessage(prev => ({ ...prev, show: false }))}
      />
    </HorseOwnerLayout>
  );
};

export default AccountSettings;
