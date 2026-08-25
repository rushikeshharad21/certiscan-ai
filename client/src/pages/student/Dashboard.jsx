import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';
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
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/documents/my');
        setDocuments(response.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const totalUploaded = documents.length;
  const pendingCount = documents.filter((doc) => doc.status === 'pending').length;
  const verifiedCount = documents.filter((doc) => doc.status === 'verified').length;
  const rejectedCount = documents.filter((doc) => doc.status === 'rejected').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Welcome, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here is an overview of your document verification status.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Total Uploaded"
            value={totalUploaded}
            color="bg-slate-100 text-slate-600"
          />
          <StatCard
            icon={Clock}
            label="Pending Review"
            value={pendingCount}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            icon={CheckCircle2}
            label="Verified"
            value={verifiedCount}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={XCircle}
            label="Rejected"
            value={rejectedCount}
            color="bg-red-50 text-red-600"
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;