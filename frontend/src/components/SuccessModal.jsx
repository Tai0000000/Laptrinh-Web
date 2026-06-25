import React, { useEffect } from 'react';

const SuccessModal = ({ isOpen, title = 'Success!', message = 'Action completed successfully.', onClose, autoCloseTime = 3000 }) => {
  useEffect(() => {
    if (isOpen && autoCloseTime > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseTime, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-sm mx-auto my-6 z-[100] px-4">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-2xl shadow-2xl overflow-hidden outline-none focus:outline-none transform transition-all scale-100 duration-300">
          
          <div className="p-6 text-center">
            {/* Animated Check Icon */}
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mb-4 animate-bounce">
              <svg className="h-8 w-8 text-green-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500 mt-2">{message}</p>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-center p-4 border-t border-gray-100 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none shadow-sm transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
