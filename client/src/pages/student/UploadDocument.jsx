import { useState, useEffect } from 'react';
import DocumentUploadCard from '../../components/student/DocumentUploadCard';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Loader2, FileText, Award, Users, IdCard, ShieldCheck } from 'lucide-react';

const documentTypes = [
  {
    type: 'marksheet',
    label: 'Marksheet',
    icon: <FileText size={20} />,
    theme: {
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      dropBorder: 'border-violet-200',
      dropActiveBg: 'bg-violet-50',
    },
  },
  {
    type: 'tc',
    label: 'Transfer Certificate',
    icon: <Award size={20} />,
    theme: {
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      dropBorder: 'border-sky-200',
      dropActiveBg: 'bg-sky-50',
    },
  },
  {
    type: 'casteCertificate',
    label: 'Caste Certificate',
    icon: <Users size={20} />,
    theme: {
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      dropBorder: 'border-emerald-200',
      dropActiveBg: 'bg-emerald-50',
    },
  },
  {
    type: 'aadhaar',
    label: 'Aadhaar Card',
    icon: <IdCard size={20} />,
    theme: {
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      dropBorder: 'border-rose-200',
      dropActiveBg: 'bg-rose-50',
    },
  },
];

const UploadDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSuccess = (newDocument) => {
    setDocuments((prev) => {
      const filtered = prev.filter((doc) => doc.documentType !== newDocument.documentType);
      return [...filtered, newDocument];
    });
  };

  const getDocumentByType = (type) => {
    return documents.find((doc) => doc.documentType === type);
  };

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
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Upload Documents</h1>
        <p className="text-sm text-slate-500 mt-1">
          Securely upload the required documents for verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {documentTypes.map(({ type, label, icon, theme }) => (
          <DocumentUploadCard
            key={type}
            documentType={type}
            label={label}
            icon={icon}
            theme={theme}
            existingDocument={getDocumentByType(type)}
            onUploadSuccess={handleUploadSuccess}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8 text-xs sm:text-sm text-slate-500 text-center px-2">
        <ShieldCheck size={16} className="text-indigo-500 shrink-0" />
        <span>Your documents are encrypted and stored securely. We never share your data with third parties.</span>
      </div>
    </div>
  );
};

export default UploadDocuments;