import cloudinary from '../config/cloudinary.js';
import Document from '../models/Document.js';
import { runOcr } from '../services/ocrService.js';
import { parseOcrData } from '../services/ocrParserService.js';
import { encrypt, maskAadhaar } from '../utils/encryption.js';
import { runTamperingDetection } from '../services/elaService.js';

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { documentType } = req.body;

    if (!documentType) {
      return res.status(400).json({ message: 'Document type is required' });
    }

    const uploadFromBuffer = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'certiscan-ai/documents',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
    };

    const result = await uploadFromBuffer();

    let ocrText = null;
    let parsedData = null;
    let aadhaarNumberEncrypted = null;

    try {
      ocrText = await runOcr(req.file.buffer, req.file.mimetype);
      parsedData = parseOcrData(documentType, ocrText);

      if (documentType === 'aadhaar' && parsedData?.aadhaarNumber) {
        aadhaarNumberEncrypted = encrypt(parsedData.aadhaarNumber);
        parsedData.aadhaarNumber = maskAadhaar(parsedData.aadhaarNumber);
      }
    } catch (ocrError) {
      ocrText = null;
    }

    let tamperingResult = null;
    try {
      tamperingResult = await runTamperingDetection(req.file.buffer, req.file.mimetype);
    } catch (elaError) {
      tamperingResult = null;
    }

    const document = await Document.create({
      student: req.user._id,
      documentType,
      fileUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      ocrData: ocrText,
      parsedData,
      aadhaarNumberEncrypted,
      tamperingRiskLevel: tamperingResult?.riskLevel || null,
      tamperingDetails: tamperingResult,
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ student: req.user._id });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
  }
};

const reparseDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, student: req.user._id });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.ocrData) {
      return res.status(400).json({ message: 'No OCR data available to parse' });
    }

    document.parsedData = parseOcrData(document.documentType, document.ocrData);
    await document.save();

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Re-parse failed', error: error.message });
  }
};
const getAdminStats = async (req, res) => {
  try {
    const totalDocuments = await Document.countDocuments();
    const pendingCount = await Document.countDocuments({ status: 'pending' });
    const verifiedCount = await Document.countDocuments({ status: 'verified' });
    const rejectedCount = await Document.countDocuments({ status: 'rejected' });
    const highRiskCount = await Document.countDocuments({ tamperingRiskLevel: 'high' });

    const totalStudents = await Document.distinct('student').then((ids) => ids.length);

    res.status(200).json({
      totalDocuments,
      pendingCount,
      verifiedCount,
      rejectedCount,
      highRiskCount,
      totalStudents,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};
const getPendingDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ status: 'pending' })
      .populate('student', 'name email collegeName phone')
      .sort({ createdAt: -1 });

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending documents', error: error.message });
  }
};

const updateDocumentStatus = async (req, res) => {
  try {
    const { status, rejectionReason, parsedData } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (parsedData) {
      document.parsedData = parsedData;
    }

    document.status = status;
    document.verifiedBy = req.user._id;
    document.verifiedAt = new Date();
    document.rejectionReason = status === 'rejected' ? rejectionReason || 'Not specified' : null;

    await document.save();

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update document status', error: error.message });
  }
};

const bulkUpdateDocumentStatus = async (req, res) => {
  try {
    const { documentIds, status } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ message: 'No documents selected' });
    }

    await Document.updateMany(
      { _id: { $in: documentIds } },
      {
        status,
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
        rejectionReason: status === 'rejected' ? 'Bulk rejection' : null,
      }
    );

    res.status(200).json({ message: `${documentIds.length} documents updated`, status });
  } catch (error) {
    res.status(500).json({ message: 'Bulk update failed', error: error.message });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate(
      'student',
      'name email collegeName phone'
    );

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch document', error: error.message });
  }
};

const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find()
      .populate('student', 'name email collegeName phone')
      .sort({ createdAt: -1 });

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
  }
};

export { uploadDocument, getMyDocuments, reparseDocument, getAdminStats, getPendingDocuments, updateDocumentStatus, bulkUpdateDocumentStatus, getDocumentById, getAllDocuments };