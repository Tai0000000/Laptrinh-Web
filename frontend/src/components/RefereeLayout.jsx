import React from 'react';
import RefereeSidebar from './RefereeSidebar';

const RefereeLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#0b0f19] overflow-hidden font-sans antialiased text-slate-200">
      {/* Sidebar */}
      <RefereeSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top ambient glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-10 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Scrollable container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-8 md:px-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RefereeLayout;
