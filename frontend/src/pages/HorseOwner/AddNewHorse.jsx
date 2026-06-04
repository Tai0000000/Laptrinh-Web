import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HorseOwnerLayout from '../../components/HorseOwnerLayout';

const AddNewHorse = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    color: '',
    microchipId: '',
    registrationNumber: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

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
    if (!formData.color.trim()) newErrors.color = 'Color is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Here you would typically send data to API
    console.log('Form submitted:', formData);
    alert('Horse added successfully!');
    navigate('/horse-owner/horses');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <HorseOwnerLayout>
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Add New Horse</h1>
          <p className="text-gray-600 mt-2">Fill in the details of your new horse</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {/* Horse Name */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Horse Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Thunder King"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Breed */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Breed *
            </label>
            <select
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.breed
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
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
            {errors.breed && <p className="text-red-500 text-sm mt-1">{errors.breed}</p>}
          </div>

          {/* Age and Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Age */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Age (years) *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g., 5"
                min="0"
                max="50"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.age
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>

            {/* Color */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Color *
              </label>
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.color
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Select a color</option>
                <option value="Black">Black</option>
                <option value="Brown">Brown</option>
                <option value="Chestnut">Chestnut</option>
                <option value="Bay">Bay</option>
                <option value="Gray">Gray</option>
                <option value="Palomino">Palomino</option>
                <option value="Other">Other</option>
              </select>
              {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color}</p>}
            </div>
          </div>

          {/* Microchip ID */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Microchip ID
            </label>
            <input
              type="text"
              name="microchipId"
              value={formData.microchipId}
              onChange={handleChange}
              placeholder="e.g., 123456789"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Registration Number */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Registration Number
            </label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              placeholder="e.g., REG-2026-001"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information about the horse..."
              rows="5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md"
            >
              Add Horse
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <p className="text-blue-700">
            <span className="font-semibold">Note:</span> Fields marked with * are required. You can update horse information later in the My Horses section.
          </p>
        </div>
      </div>
    </HorseOwnerLayout>
  );
};

export default AddNewHorse;
