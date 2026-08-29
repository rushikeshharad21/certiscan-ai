import express from 'express';
import {
  uploadDocument,
  getMyDocuments,
  reparseDocument,
  getAdminStats,
  getPendingDocuments,
  updateDocumentStatus,
  bulkUpdateDocumentStatus,
  getDocumentById,
  getAllDocuments,
  getReportsData
} from '../controllers/documentController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

router.post('/upload', protect, upload.single('document'), uploadDocument);
router.get('/my', protect, getMyDocuments);
router.post('/:id/reparse', protect, reparseDocument);

router.get('/admin/stats', protect, isAdmin, getAdminStats);
router.get('/admin/reports', protect, isAdmin, getReportsData);
router.get('/admin/pending', protect, isAdmin, getPendingDocuments);
router.get('/admin/documents', protect, isAdmin, getAllDocuments);
router.patch('/admin/:id/status', protect, isAdmin, updateDocumentStatus);
router.patch('/admin/bulk-status', protect, isAdmin, bulkUpdateDocumentStatus);
router.get('/admin/:id', protect, isAdmin, getDocumentById);

export default router;