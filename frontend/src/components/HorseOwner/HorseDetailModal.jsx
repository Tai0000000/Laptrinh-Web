import React from 'react';

const HorseDetailModal = ({ isOpen, horse, onClose, onEdit, onDelete }) => {
  if (!isOpen || !horse) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md mx-auto my-6 z-50 px-4">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-2xl shadow-2xl overflow-hidden outline-none focus:outline-none transform transition-all scale-100 duration-300">
          
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-100 rounded-t bg-gray-55">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Horse Details</h3>
              <p className="text-sm text-gray-500 mt-1">Detailed information of {horse.name}</p>
            </div>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-gray-400 hover:text-gray-600 float-right text-3xl leading-none font-semibold outline-none focus:outline-none transition-colors"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          {/* Details Body */}
          <div className="relative p-6 flex-auto space-y-4">
            {/* Avatar / Badge Placeholder */}
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 text-2xl font-bold">
                {horse.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800">{horse.name}</h4>
                <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold uppercase ${
                  horse.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : horse.status === 'resting'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {horse.status || 'Active'}
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Breed</p>
                <p className="text-base font-semibold text-gray-700">{horse.breed}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Age</p>
                <p className="text-base font-semibold text-gray-700">{horse.age} years old</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Horse ID</p>
                <p className="text-base font-semibold text-gray-700">#{horse.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Owner ID</p>
                <p className="text-base font-semibold text-gray-700">#{horse.horse_owner_id || 10}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
            <div>
              <button
                type="button"
                onClick={() => {
                  onDelete(horse);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none shadow-sm transition-colors"
              >
                Delete
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onEdit(horse);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none shadow-sm transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-55 focus:outline-none transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorseDetailModal;
