import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../pages/student/Sidebar';
import Navbar from '../pages/student/Navbar';

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;