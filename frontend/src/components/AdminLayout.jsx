import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

function AdminLayout({ activeTab, setActiveTab, children }) {
  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-100 font-sans">
      {/* Left side: Navigation Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Right side: Header Topbar & Main content area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Sticky top headers */}
        <AdminTopbar />

        {/* Dynamic content wrapper */}
        <main className="flex-1 p-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
