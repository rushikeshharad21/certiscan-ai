import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from "../pages/admin/Sidebar.jsx";
import Navbar from '../pages/admin/Navbar.jsx';

const AdminLayout = () => {
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

export default AdminLayout;