import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle2, XCircle, SkipForward, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const riskConfig = {
  low: { label: 'Low Risk', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  medium: { label: 'Medium Risk', color: 'text-amber-600', bg: 'bg-amber-50' },
  high: { label: 'High Risk', color: 'text-red-600', bg: 'bg-red-50' },
};

const fieldLabels = {
  name: 'Name',
  studentName: 'Student Name',
  fatherName: "Father's Name",
  motherName: "Mother's Name",
  dateOfBirth: 'Date of Birth',
  nationality: 'Nationality',
  category: 'Category',
  caste: 'Caste',
  subCaste: 'Sub Caste',
  certificateNumber: 'Certificate Number',
  issuingAuthority: 'Issuing Authority',
  taluka: 'Taluka',
  district: 'District',
  dateOfFirstAdmission: 'Date of First Admission',
  lastClassStudied: 'Last Class Studied',
  examResult: 'Exam Result',
  subjectsStudied: 'Subjects Studied',
  dateOfIssue: 'Date of Issue',
  prn: 'PRN',
  seatNumber: 'Seat Number',
  college: 'College',
  programme: 'Programme',
  percentage: 'Percentage',
  cgpa: 'CGPA',
  finalResult: 'Final Result',
  gender: 'Gender',
  aadhaarNumber: 'Aadhaar Number',
  address: 'Address',
};

const DocumentReviewModal = ({ documentId, onClose, onActionComplete }) => {
  const [document, setDocument] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDocument = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/documents/admin/${documentId}`);
      setDocument(response.data);
      setEditedFields(response.data.parsedData || {});
    } catch (error) {
      toast.error('Failed to load document');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const handleFieldChange = (key, value) => {
    setEditedFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleAction = useCallback(
    async (status) => {
      if (!document || actionLoading) return;
      setActionLoading(true);
      try {
        await api.patch(`/documents/admin/${document._id}/status`, {
          status,
          parsedData: editedFields,
        });
        toast.success(`Document ${status}`);
        onActionComplete(document._id);
        onClose();
      } catch (error) {
        toast.error('Action failed');
      } finally {
        setActionLoading(false);
      }
    },
    [document, editedFields, actionLoading, onActionComplete, onClose]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'v' || e.key === 'V') handleAction('verified');
      if (e.key === 'r' || e.key === 'R') handleAction('rejected');
      if (e.key === 'n' || e.key === 'N') onClose();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAction, onClose]);

  const risk = document?.tamperingRiskLevel ? riskConfig[document.tamperingRiskLevel] : null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-semibold text-slate-900">Review Document</h2>
            {document && (
              <p className="text-xs text-slate-500 mt-0.5">
                {document.student?.name} · {document.student?.email}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-slate-900" size={28} />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="border-r border-slate-100 bg-slate-50 p-4 flex items-center justify-center">
                {document.fileUrl.endsWith('.pdf') ? (
                  <iframe
                    src={document.fileUrl}
                    title="Document preview"
                    className="w-full h-[400px] md:h-full rounded-lg border border-slate-200"
                  />
                ) : (
                  <img
                    src={document.fileUrl}
                    alt="Document"
                    className="max-w-full max-h-[400px] md:max-h-full rounded-lg border border-slate-200 object-contain"
                  />
                )}
              </div>

              <div className="p-5 space-y-4">
                {risk && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${risk.color} ${risk.bg}`}>
                    <AlertTriangle size={16} />
                    Tampering Detection: {risk.label}
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                    Extracted Details (editable)
                  </p>
                  <div className="space-y-3">
                    {Object.keys(editedFields).length === 0 && (
                      <p className="text-sm text-slate-400">No structured data available</p>
                    )}
                    {Object.entries(editedFields).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-xs text-slate-500 mb-1">
                          {fieldLabels[key] || key}
                        </label>
                        <input
                          type="text"
                          value={value || ''}
                          onChange={(e) => handleFieldChange(key, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 shrink-0 flex-wrap">
              <p className="text-xs text-slate-400 hidden sm:block">
                Shortcuts: <span className="font-medium text-slate-500">V</span> verify ·{' '}
                <span className="font-medium text-slate-500">R</span> reject ·{' '}
                <span className="font-medium text-slate-500">N</span> skip
              </p>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={onClose}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-all disabled:opacity-60"
                >
                  <SkipForward size={15} />
                  Skip
                </button>
                <button
                  onClick={() => handleAction('rejected')}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  <XCircle size={15} />
                  Reject
                </button>
                <button
                  onClick={() => handleAction('verified')}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  <CheckCircle2 size={15} />
                  Verify
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentReviewModal;