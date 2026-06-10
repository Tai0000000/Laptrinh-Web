import React from 'react';
import HorseOwnerSidebar from './HorseOwnerSidebar';

const HorseOwnerLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <HorseOwnerSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default HorseOwnerLayout;
