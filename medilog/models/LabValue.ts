import mongoose, { Schema, Document as MongoDocument } from 'mongoose';

export interface ILabValue extends MongoDocument {
  documentId: mongoose.Types.ObjectId;
  name: string;
  value: number;
  unit: string;
  referenceRange?: {
    min: number;
    max: number;
  };
  status: 'normal' | 'high' | 'low' | 'critical';
  confidence: number;
  extractedDate: Date;
}

const labValueSchema = new Schema<ILabValue>({
  documentId: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
    trim: true,
  },
  referenceRange: {
    min: {
      type: Number,
    },
    max: {
      type: Number,
    },
  },
  status: {
    type: String,
    enum: ['normal', 'high', 'low', 'critical'],
    default: 'normal',
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.85,
  },
  extractedDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Create indexes for efficient querying
labValueSchema.index({ documentId: 1 });
labValueSchema.index({ name: 1 });
labValueSchema.index({ status: 1 });
labValueSchema.index({ extractedDate: -1 });

// Compound index for trend analysis
labValueSchema.index({ name: 1, extractedDate: -1 });

// Virtual for determining if value is abnormal
labValueSchema.virtual('isAbnormal').get(function() {
  return this.status !== 'normal';
});

// Method to update status based on reference range
labValueSchema.methods.updateStatus = function() {
  if (!this.referenceRange) return;
  
  if (this.value < this.referenceRange.min) {
    this.status = 'low';
  } else if (this.value > this.referenceRange.max) {
    this.status = 'high';
  } else {
    this.status = 'normal';
  }
  
  // Check for critical values (can be customized per test)
  if (this.name.toLowerCase().includes('glucose') && this.value < 70) {
    this.status = 'critical';
  }
};

export default mongoose.models.LabValue || mongoose.model<ILabValue>('LabValue', labValueSchema);
