import { useState, useEffect, useMemo, useCallback } from 'react';
import { List } from 'react-window';
import * as XLSX from 'xlsx';
import { debounce } from 'lodash';
import {
  FileText,
  Award,
  Users,
  IdCard,
  Search,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DocumentReviewModal from '../admin/DocumentReviewModal.jsx';

const typeConfig = {
  marksheet: { label: 'Marksheet', icon: FileText, color: 'text-violet-600', bg: 'bg-violet-100' },
  tc: { label: 'Transfer Certificate', icon: Award, color: 'text-sky-600', bg: 'bg-sky-100' },
  casteCertificate: { label: 'Caste Certificate', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  aadhaar: { label: 'Aadhaar Card', icon: IdCard, color: 'text-rose-600', bg: 'bg-rose-100' },
};

const statusConfig = {
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  verified: { label: 'Verified', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
};

const statusFilters = ['all', 'pending', 'verified', 'rejected'];

const ROW_HEIGHT = 64;

const Row = ({ index, style, documents, onRowClick }) => {
  const doc = documents[index];
  const type = typeConfig[doc.documentType];
  const status = statusConfig[doc.status];
  const TypeIcon = type?.icon || FileText;
  const StatusIcon = status?.icon || Clock;

  return (
    <div
      style={style}
      onClick={() => onRowClick(doc._id)}
      className="flex items-center gap-3 px-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${type?.bg}`}>
        <TypeIcon size={16} className={type?.color} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{doc.student?.name}</p>
        <p className="text-xs text-slate-400 truncate">{type?.label}</p>
      </div>

      {doc.tamperingRiskLevel === 'high' && (
        <AlertTriangle size={15} className="text-red-500 shrink-0" />
      )}

      <span
        className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${status?.color} ${status?.bg}`}
      >
        <StatusIcon size={12} />
        {status?.label}
      </span>

      <span className="hidden md:block text-xs text-slate-400 whitespace-nowrap shrink-0 w-20 text-right">
        {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
      </span>
    </div>
  );
};

const AllDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewDocId, setReviewDocId] = useState(null);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents/admin/documents');
      setDocuments(response.data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const debouncedSetSearch = useMemo(() => debounce((value) => setSearchQuery(value), 300), []);

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
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery.trim() === '' ||
        doc.student?.name?.toLowerCase().includes(searchLower) ||
        doc.student?.email?.toLowerCase().includes(searchLower) ||
        typeConfig[doc.documentType]?.label.toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch;
    });
  }, [documents, statusFilter, searchQuery]);

  const handleModalActionComplete = () => {
    fetchDocuments();
  };

  const handleExportExcel = () => {
    const exportData = filteredDocuments.map((doc) => ({
      'Student Name': doc.student?.name || '',
      'Student Email': doc.student?.email || '',
      'Document Type': typeConfig[doc.documentType]?.label || doc.documentType,
      Status: statusConfig[doc.status]?.label || doc.status,
      'Tampering Risk': doc.tamperingRiskLevel || 'N/A',
      'Uploaded On': new Date(doc.createdAt).toLocaleDateString('en-IN'),
      'Verified On': doc.verifiedAt ? new Date(doc.verifiedAt).toLocaleDateString('en-IN') : '',
      'Rejection Reason': doc.rejectionReason || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Documents');
    XLSX.writeFile(workbook, `certiscan-documents-${Date.now()}.xlsx`);
    toast.success('Excel file downloaded');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-slate-900" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-start justify-between gap-3 mb-6 sm:mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">All Documents</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and export all uploaded documents ({filteredDocuments.length}).
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 active:scale-[0.98] transition-all"
        >
          <Download size={16} />
          Export Excel
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search by student name, email, or document type..."
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
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <List
            rowComponent={Row}
            rowCount={filteredDocuments.length}
            rowHeight={ROW_HEIGHT}
            rowProps={{ documents: filteredDocuments, onRowClick: setReviewDocId }}
            style={{ height: Math.min(filteredDocuments.length * ROW_HEIGHT, 560) }}
          />
        </div>
      )}

      {reviewDocId && (
        <DocumentReviewModal
          documentId={reviewDocId}
          onClose={() => setReviewDocId(null)}
          onActionComplete={handleModalActionComplete}
        />
      )}
    </div>
  );
};

export default AllDocuments;