export interface User {
  _id: string;
  email: string;
  name: string;
  password: string;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContacts?: EmergencyContact[];
  language: 'en' | 'np';
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Document {
  _id: string;
  userId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  category: DocumentCategory;
  tags: string[];
  supabasePath: string;
  extractedText?: string;
  labValues?: LabValue[];
  summary?: string;
  uploadDate: Date;
  updatedAt: Date;
}

export type DocumentCategory = 'Lab Reports' | 'Prescriptions' | 'Imaging' | 'Other';

export interface LabValue {
  _id: string;
  documentId: string;
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

export interface HealthProfile {
  userId: string;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContacts: EmergencyContact[];
  lastUpdated: Date;
}

export interface Reminder {
  _id: string;
  userId: string;
  title: string;
  description: string;
  type: 'medicine' | 'checkup' | 'lab' | 'other';
  dueDate: Date;
  isCompleted: boolean;
  createdAt: Date;
}

export interface AIExtractionResult {
  labValues: LabValue[];
  summary: string;
  confidence: number;
  processingTime: number;
}

export interface SearchFilters {
  query?: string;
  category?: DocumentCategory;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  hasLabValues?: boolean;
}

export interface BulkAction {
  documentIds: string[];
  action: 'tag' | 'delete' | 'download';
  tags?: string[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

export interface QRHealthSummary {
  name: string;
  bloodType: string;
  allergies: string[];
  emergencyContacts: EmergencyContact[];
  qrCode: string;
}
