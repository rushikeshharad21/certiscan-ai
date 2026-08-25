import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, FileText, User, X } from 'lucide-react';
import Logo from '../../components/common/Logo';

const navItems = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/upload-documents', label: 'Upload Documents', icon: UploadCloud },
  { to: '/student/my-documents', label: 'My Documents', icon: FileText },
  { to: '/student/profile', label: 'Profile', icon: User },
];

const Sidebar = ({ open, onClose }) => {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

           <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-200 lg:translate-x-0 lg:sticky lg:z-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
          <Logo />
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;