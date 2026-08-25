import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    documentType: {
      type: String,
      enum: ['marksheet', 'tc', 'casteCertificate', 'aadhaar'],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    ocrData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    parsedData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    aadhaarNumberEncrypted: {
      type: String,
      default: null,
      select: false,
    },
    tamperingRiskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', null],
      default: null,
    },
    tamperingDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

documentSchema.index({ student: 1, documentType: 1 });
documentSchema.index({ status: 1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;