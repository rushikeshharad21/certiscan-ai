import { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';
import { Search, FileText, Award, Users, IdCard, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const typeConfig = {
  marksheet: { label: 'Marksheet', icon: FileText, color: 'text-violet-600', bg: 'bg-violet-100' },
  tc: { label: 'Transfer Certificate', icon: Award, color: 'text-sky-600', bg: 'bg-sky-100' },
  casteCertificate: { label: 'Caste Certificate', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  aadhaar: { label: 'Aadhaar Card', icon: IdCard, color: 'text-rose-600', bg: 'bg-rose-100' },
};

const statusConfig = {
  pending: { label: 'Pending Review', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  verified: { label: 'Verified', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
};

const statusFilters = ['all', 'pending', 'verified', 'rejected'];

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/documents/my');
        setDocuments(response.data);
      } catch (error) {
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const debouncedSetSearch = useMemo(
    () => debounce((value) => setSearchQuery(value), 300),
    []
  );

  const handleSearchChange = useCallback(
    (e) => {
      setSearchInput(e.target.value);
      debouncedSetSearch(e.target.value);
    },
    [debouncedSetSearch]
  );

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      const label = typeConfig[doc.documentType]?.label || '';
      const matchesSearch =
        searchQuery.trim() === '' ||
        label.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [documents, statusFilter, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-slate-900" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Documents</h1>
        <p className="text-sm text-slate-500 mt-1">
          View and track the status of your uploaded documents.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search by document type..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'all' ? 'All' : statusConfig[status].label}
            </button>
          ))}
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FileText size={32} className="mx-auto mb-3" />
          <p className="text-sm">No documents found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((doc) => {
            const type = typeConfig[doc.documentType];
            const status = statusConfig[doc.status];
            const TypeIcon = type?.icon || FileText;
            const StatusIcon = status?.icon || Clock;

            return (
              <a
                key={doc._id}
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${type?.bg}`}>
                    <TypeIcon size={18} className={type?.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 text-sm sm:text-base truncate">
                      {type?.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${status?.color} ${status?.bg}`}
                >
                  <StatusIcon size={13} />
                  {status?.label}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyDocuments;