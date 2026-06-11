import React, { useState } from 'react';
import axios from 'axios';

const ConfirmDeleteModal = ({ isOpen, horse, onClose, onSuccess }) => {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !horse) return null;

  const handleConfirmDelete = () => {
    setDeleting(true);
    axios.delete(`http://localhost:8000/api/horses/${horse.id}`)
      .then(() => {
        onSuccess();
        onClose();
      })
      .catch((err) => {
        console.error('Error deleting horse:', err);
        alert(err.response?.data?.message || 'Failed to delete horse. Please try again.');
      })
      .finally(() => {
        setDeleting(false);
      });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-sm mx-auto my-6 z-[60] px-4">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-2xl shadow-2xl overflow-hidden outline-none focus:outline-none transform transition-all scale-100 duration-300">
          
          {/* Header & Icon */}
          <div className="p-6 text-center">
            {/* Warning Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800">Delete Horse</h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to delete <span className="font-semibold text-gray-700">"{horse.name}"</span>? This action cannot be undone.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-center p-6 border-t border-gray-100 bg-gray-50 gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-55 focus:outline-none transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none shadow-sm transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
