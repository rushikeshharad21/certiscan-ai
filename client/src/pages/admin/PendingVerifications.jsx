import { useState, useEffect } from 'react';
import { FileText, Award, Users, IdCard, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DocumentReviewModal from "../../pages/admin/DocumentReviewModal.jsx"

const typeConfig = {
  marksheet: { label: 'Marksheet', icon: FileText, color: 'text-violet-600', bg: 'bg-violet-100' },
  tc: { label: 'Transfer Certificate', icon: Award, color: 'text-sky-600', bg: 'bg-sky-100' },
  casteCertificate: { label: 'Caste Certificate', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  aadhaar: { label: 'Aadhaar Card', icon: IdCard, color: 'text-rose-600', bg: 'bg-rose-100' },
};

const riskConfig = {
  low: { label: 'Low Risk', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  medium: { label: 'Medium Risk', color: 'text-amber-600', bg: 'bg-amber-50' },
  high: { label: 'High Risk', color: 'text-red-600', bg: 'bg-red-50' },
};

const PendingVerifications = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewDocId, setReviewDocId] = useState(null);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents/admin/pending');
      setDocuments(response.data);
    } catch (error) {
      toast.error('Failed to load pending documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === documents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(documents.map((doc) => doc._id));
    }
  };

  const handleSingleAction = async (id, status) => {
    setActionLoading(true);
    try {
      await api.patch(`/documents/admin/${id}/status`, { status });
      toast.success(`Document ${status}`);
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (status) => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      await api.patch('/documents/admin/bulk-status', { documentIds: selectedIds, status });
      toast.success(`${selectedIds.length} documents ${status}`);
      setDocuments((prev) => prev.filter((doc) => !selectedIds.includes(doc._id)));
      setSelectedIds([]);
    } catch (error) {
      toast.error('Bulk action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleModalActionComplete = (docId) => {
    setDocuments((prev) => prev.filter((doc) => doc._id !== docId));
    setSelectedIds((prev) => prev.filter((item) => item !== docId));
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
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Pending Verifications</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review and verify or reject uploaded documents.
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <CheckCircle2 size={32} className="mx-auto mb-3" />
          <p className="text-sm">No pending documents</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={selectedIds.length === documents.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-slate-300"
              />
              Select all ({documents.length})
            </label>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{selectedIds.length} selected</span>
                <button
                  onClick={() => handleBulkAction('verified')}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  Verify Selected
                </button>
                <button
                  onClick={() => handleBulkAction('rejected')}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  Reject Selected
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {documents.map((doc) => {
              const type = typeConfig[doc.documentType];
              const risk = doc.tamperingRiskLevel ? riskConfig[doc.tamperingRiskLevel] : null;
              const TypeIcon = type?.icon || FileText;

              return (
                <div
                  key={doc._id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setReviewDocId(doc._id)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(doc._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelect(doc._id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 mt-1 rounded border-slate-300 shrink-0"
                    />

                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${type?.bg}`}>
                      <TypeIcon size={18} className={type?.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-medium text-slate-900 text-sm sm:text-base">
                            {type?.label}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {doc.student?.name} · {doc.student?.email}
                          </p>
                        </div>

                        {risk && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${risk.color} ${risk.bg}`}>
                            <AlertTriangle size={12} />
                            {risk.label}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-medium text-slate-500 hover:text-slate-900 underline"
                        >
                          View Document
                        </a>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSingleAction(doc._id, 'verified');
                          }}
                          disabled={actionLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 active:scale-[0.98] transition-all disabled:opacity-60"
                        >
                          <CheckCircle2 size={14} />
                          Verify
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSingleAction(doc._id, 'rejected');
                          }}
                          disabled={actionLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 active:scale-[0.98] transition-all disabled:opacity-60"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
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

export default PendingVerifications;