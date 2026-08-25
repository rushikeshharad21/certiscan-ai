import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Compressor from 'compressorjs';
import { UploadCloud, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusConfig = {
  notUploaded: { label: 'Not Uploaded', color: 'text-slate-500', bg: 'bg-slate-100' },
  pending: { label: 'Pending Review', color: 'text-amber-600', bg: 'bg-amber-50' },
  verified: { label: 'Verified', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50' },
};

const DocumentUploadCard = ({ documentType, label, icon, theme, existingDocument, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const status = existingDocument ? existingDocument.status : 'notUploaded';
  const config = statusConfig[status];

  const compressFile = (file) => {
    return new Promise((resolve, reject) => {
      if (file.type === 'application/pdf') {
        resolve(file);
        return;
      }
      new Compressor(file, {
        quality: 0.7,
        maxWidth: 1920,
        maxHeight: 1920,
        success: resolve,
        error: reject,
      });
    });
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setProgress(0);

    try {
      const compressedFile = await compressFile(file);

      const formData = new FormData();
      formData.append('document', compressedFile, file.name);
      formData.append('documentType', documentType);

      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        },
      });

      toast.success(`${label} uploaded successfully`);
      onUploadSuccess(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'application/pdf': [],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: uploading,
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${theme.iconBg}`}>
            <span className={theme.iconColor}>{icon}</span>
          </div>
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">{label}</h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap ${config.color} ${config.bg}`}>
          {status === 'verified' && <CheckCircle2 size={13} />}
          {status === 'rejected' && <XCircle size={13} />}
          {status === 'pending' && <Clock size={13} />}
          {config.label}
        </span>
      </div>

      <div
        {...getRootProps()}
        className={`rounded-xl border-2 border-dashed p-5 sm:p-8 text-center cursor-pointer transition-all active:scale-[0.98] ${theme.dropBorder} ${
          isDragActive ? theme.dropActiveBg : 'hover:bg-slate-50'
        } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-slate-900" size={24} />
            <p className="text-sm text-slate-600">Uploading... {progress}%</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
              <div
                className="bg-slate-900 h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : existingDocument ? (
          <div className="flex flex-col items-center gap-2">
            <span className={theme.iconColor}>{icon}</span>
            <p className="text-sm font-medium text-slate-700">Click or drag to replace</p>
            <p className="text-xs text-slate-400">JPG, PNG or PDF, max 5MB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UploadCloud className={theme.iconColor} size={28} />
            <p className="text-sm font-medium text-slate-700">Drag & drop or click to upload</p>
            <p className="text-xs text-slate-400">JPG, PNG or PDF, max 5MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadCard;