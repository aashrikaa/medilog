import mongoose, { Schema, Document as MongoDocument } from 'mongoose';

export interface IDocument extends MongoDocument {
  userId: mongoose.Types.ObjectId;
  filename: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  category: 'Lab Reports' | 'Prescriptions' | 'Imaging' | 'Other';
  tags: string[];
  supabasePath: string;
  extractedText?: string;
  labValues?: mongoose.Types.ObjectId[];
  summary?: string;
  uploadDate: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  supabasePath: {
    type: String,
    required: true,
  },
  extractedText: {
    type: String,
  },
  labValues: [{
    type: Schema.Types.ObjectId,
    ref: 'LabValue',
  }],
  summary: {
    type: String,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Create indexes for efficient querying
documentSchema.index({ userId: 1, category: 1 });
documentSchema.index({ userId: 1, tags: 1 });
documentSchema.index({ userId: 1, uploadDate: -1 });
documentSchema.index({ userId: 1, 'labValues.0': { $exists: true } });

// Text search index
documentSchema.index({
  originalName: 'text',
  extractedText: 'text',
  tags: 'text',
});

export default mongoose.models.Document || mongoose.model<IDocument>('Document', documentSchema);
