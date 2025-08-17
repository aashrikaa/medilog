'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';

interface DocumentUploadProps {
  onClose: () => void;
  onUpload: (document: any) => void;
  userLanguage: 'en' | 'np';
}

export default function DocumentUpload({ onClose, onUpload, userLanguage }: DocumentUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [aiProcessing, setAiProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];
    
    if (file && supportedTypes.includes(file.type)) {
      setUploadedFile(file);
      setError('');
    } else {
      setError('Please select a valid file type (PDF, DOCX, TXT, PNG, JPG)');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/jpg': ['.jpg']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (!uploadedFile || !category) {
      setError('Please select a file and choose a category');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('category', category);
      if (tags) {
        formData.append('tags', tags);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      onUpload(data.document);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setError('');
  };

  const getLanguageText = (en: string, np: string) => {
    return userLanguage === 'np' ? np : en;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {getLanguageText('Upload Medical Document', 'चिकित्सा दस्तावेज अपलोड गर्नुहोस्')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {getLanguageText('Select Document File', 'दस्तावेज फाइल चयन गर्नुहोस्')}
            </label>
            
            <div
              {...getRootProps()}
              className={cn(
                "file-upload-area cursor-pointer transition-all duration-200",
                isDragActive && "dragover",
                uploadedFile && "border-green-300 bg-green-50"
              )}
            >
              <input {...getInputProps()} />
              
              {uploadedFile ? (
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-medium text-green-800">
                    {getLanguageText('File Selected', 'फाइल चयन गरियो')}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {uploadedFile.name} ({formatFileSize(uploadedFile.size)})
                  </p>
                  <button
                    onClick={removeFile}
                    className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
                  >
                    {getLanguageText('Remove File', 'फाइल हटाउनुहोस्')}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-lg font-medium text-gray-600">
                    {isDragActive 
                      ? getLanguageText('Drop the file here', 'फाइल यहाँ छोड्नुहोस्')
                      : getLanguageText('Drag & drop file here', 'फाइल यहाँ तान्नुहोस् र छोड्नुहोस्')
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {getLanguageText('or click to browse', 'वा ब्राउज गर्न क्लिक गर्नुहोस्')}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {getLanguageText('Supported: PDF, DOCX, TXT, PNG, JPG | Max: 10MB', 'समर्थित: PDF, DOCX, TXT, PNG, JPG | अधिकतम: १०MB')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              {getLanguageText('Document Category', 'दस्तावेज श्रेणी')}
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">
                {getLanguageText('Select a category', 'श्रेणी चयन गर्नुहोस्')}
              </option>
              <option value="Lab Reports">
                {getLanguageText('Lab Reports', 'प्रयोगशाला रिपोर्टहरू')}
              </option>
              <option value="Prescriptions">
                {getLanguageText('Prescriptions', 'पर्स्क्रिप्सनहरू')}
              </option>
              <option value="Imaging">
                {getLanguageText('Imaging', 'इमेजिङ')}
              </option>
              <option value="Other">
                {getLanguageText('Other', 'अन्य')}
              </option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              {getLanguageText('Tags (optional)', 'ट्यागहरू (वैकल्पिक)')}
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={getLanguageText('e.g., diabetes, blood test, urgent', 'उदाहरण: मधुमेह, रगत परीक्षण, तत्काल')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {getLanguageText('Separate tags with commas', 'ट्यागहरूलाई अल्पविरामले छुट्याउनुहोस्')}
            </p>
          </div>

          {/* AI Processing Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">
                  {getLanguageText('AI-Powered Processing (Lab Reports Only)', 'AI-संचालित प्रक्रिया (प्रयोगशाला रिपोर्टहरू मात्र)')}
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  {getLanguageText(
                    'When you select "Lab Reports" as category, your document will be automatically analyzed to extract lab values, generate summaries, and suggest relevant tags. Other document types will be stored without AI processing.',
                    'जब तपाईं श्रेणीको रूपमा "प्रयोगशाला रिपोर्टहरू" चयन गर्नुहुन्छ, तपाईंको दस्तावेज स्वचालित रूपमा विश्लेषण गरिनेछ रगत परीक्षण मानहरू निकाल्न, सारांशहरू सिर्जना गर्न र सम्बन्धित ट्यागहरू सुझाव गर्न। अन्य दस्तावेज प्रकारहरू AI प्रक्रिया बिना संग्रह गरिनेछन्।'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {getLanguageText('Uploading...', 'अपलोड गर्दै...')}
                </span>
                <span className="text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {getLanguageText('Cancel', 'रद्द गर्नुहोस्')}
            </button>
            <button
              onClick={handleUpload}
              disabled={!uploadedFile || !category || isUploading}
              className={cn(
                "px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                uploadedFile && category && !isUploading
                  ? "bg-primary-600 hover:bg-primary-700"
                  : "bg-gray-400 cursor-not-allowed"
              )}
            >
              {isUploading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {getLanguageText('Processing...', 'प्रक्रिया गर्दै...')}
                </span>
              ) : (
                getLanguageText('Upload & Process', 'अपलोड र प्रक्रिया गर्नुहोस्')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
