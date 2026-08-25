import { useState, useEffect } from 'react';
import { FileStack, Clock, CheckCircle2, XCircle, AlertTriangle, Users } from 'lucide-react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/documents/admin/stats');
        setStats(response.data);
      } catch (error) {
        toast.error('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Welcome, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here is an overview of the document verification system.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={FileStack}
            label="Total Documents"
            value={stats?.totalDocuments ?? 0}
            color="bg-slate-100 text-slate-600"
          />
          <StatCard
            icon={Clock}
            label="Pending Review"
            value={stats?.pendingCount ?? 0}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            icon={CheckCircle2}
            label="Verified"
            value={stats?.verifiedCount ?? 0}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={XCircle}
            label="Rejected"
            value={stats?.rejectedCount ?? 0}
            color="bg-red-50 text-red-600"
          />
          <StatCard
            icon={AlertTriangle}
            label="High Risk Flags"
            value={stats?.highRiskCount ?? 0}
            color="bg-orange-50 text-orange-600"
          />
          <StatCard
            icon={Users}
            label="Total Students"
            value={stats?.totalStudents ?? 0}
            color="bg-sky-50 text-sky-600"
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;