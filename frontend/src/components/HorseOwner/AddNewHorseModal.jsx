import React, { useState } from 'react';
import axios from 'axios';

const AddNewHorseModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    status: 'active',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Horse name is required';
    if (!formData.breed.trim()) newErrors.breed = 'Breed is required';
    if (!formData.age || formData.age <= 0) newErrors.age = 'Valid age is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    axios.post('http://localhost:8000/api/horses', {
      name: formData.name,
      breed: formData.breed,
      age: parseInt(formData.age),
      horse_owner_id: 10, // Hardcoded for testing
      status: formData.status
    })
    .then((response) => {
      // Clear form
      setFormData({
        name: '',
        breed: '',
        age: '',
        status: 'active',
      });
      onSuccess();
      onClose();
    })
    .catch((err) => {
      console.error('Error adding horse:', err);
      alert(err.response?.data?.message || 'Failed to add horse. Please try again.');
    })
    .finally(() => {
      setSubmitting(false);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg mx-auto my-6 z-50 px-4">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-2xl shadow-2xl overflow-hidden outline-none focus:outline-none transform transition-all scale-100 duration-300">
          
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-150 rounded-t">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Add New Horse</h3>
              <p className="text-sm text-gray-500 mt-1">Register a new horse to your collection</p>
            </div>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-gray-400 hover:text-gray-600 float-right text-3xl leading-none font-semibold outline-none focus:outline-none transition-colors"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="relative p-6 flex-auto">
              {/* Horse Name */}
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Horse Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Thunderbolt"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-300'
                      : 'border-gray-300 focus:ring-blue-300 focus:border-blue-500'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
              </div>

              {/* Breed */}
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Breed *
                </label>
                <select
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.breed
                      ? 'border-red-500 focus:ring-red-300'
                      : 'border-gray-300 focus:ring-blue-300 focus:border-blue-500'
                  }`}
                >
                  <option value="">Select a breed</option>
                  <option value="Thoroughbred">Thoroughbred</option>
                  <option value="Arabian">Arabian</option>
                  <option value="Quarter Horse">Quarter Horse</option>
                  <option value="Mustang">Mustang</option>
                  <option value="Warmblood">Warmblood</option>
                  <option value="Other">Other</option>
                </select>
                {errors.breed && <p className="text-red-500 text-xs mt-1 font-medium">{errors.breed}</p>}
              </div>

              {/* Age and Status */}
              <div className="grid grid-cols-2 gap-4">
                {/* Age */}
                <div className="mb-5">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Age (years) *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g., 4"
                    min="1"
                    max="40"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.age
                        ? 'border-red-500 focus:ring-red-300'
                        : 'border-gray-300 focus:ring-blue-300 focus:border-blue-500'
                    }`}
                  />
                  {errors.age && <p className="text-red-500 text-xs mt-1 font-medium">{errors.age}</p>}
                </div>

                {/* Status */}
                <div className="mb-5">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="resting">Resting</option>
                    <option value="injured">Injured</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end p-6 border-t border-gray-150 rounded-b gap-3 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none shadow-md transition-colors disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add Horse'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewHorseModal;
