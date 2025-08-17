'use client';

import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Tag, 
  Calendar,
  CheckSquare,
  Square,
  MoreVertical,
  Search
} from 'lucide-react';
import { cn, formatFileSize, formatDate, getCategoryColor } from '@/lib/utils';

interface Document {
  _id: string;
  filename: string;
  originalName: string;
  category: string;
  fileType: string;
  tags: string[];
  uploadDate: string;
  fileSize: number;
  summary?: string;
  labValuesCount?: number;
}

interface DocumentListProps {
  documents: Document[];
  selectedDocuments: string[];
  onSelectionChange: (selected: string[]) => void;
  onDocumentUpdate: () => void;
}

export default function DocumentList({ 
  documents, 
  selectedDocuments, 
  onSelectionChange, 
  onDocumentUpdate 
}: DocumentListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSelectDocument = (documentId: string) => {
    if (selectedDocuments.includes(documentId)) {
      onSelectionChange(selectedDocuments.filter(id => id !== documentId));
    } else {
      onSelectionChange([...selectedDocuments, documentId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(documents.map(doc => doc._id));
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        onDocumentUpdate();
        // Remove from selected if it was selected
        onSelectionChange(selectedDocuments.filter(id => id !== documentId));
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleDownloadDocument = async (documentId: string, filename: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        break;
      case 'name':
        comparison = a.originalName.localeCompare(b.originalName);
        break;
      case 'size':
        comparison = a.fileSize - b.fileSize;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
        <p className="text-gray-600 mb-6">
          Upload your first medical document to get started with AI-powered analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAll}
              className="text-gray-600 hover:text-gray-800"
            >
              {selectedDocuments.length === documents.length ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
            <span className="text-sm text-gray-600">
              {selectedDocuments.length} of {documents.length} selected
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Sort Controls */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-gray-600 hover:text-gray-800"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "px-3 py-1 text-sm",
                viewMode === 'grid' 
                  ? "bg-primary-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "px-3 py-1 text-sm",
                viewMode === 'list' 
                  ? "bg-primary-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Documents Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDocuments.map((document) => (
            <DocumentCard
              key={document._id}
              document={document}
              isSelected={selectedDocuments.includes(document._id)}
              onSelect={() => handleSelectDocument(document._id)}
               onDelete={() => handleDeleteDocument(document._id)}
              onDownload={() => handleDownloadDocument(document._id, document.originalName)}
               onView={() => {
                 const token = localStorage.getItem('token');
                 const viewUrl = `/api/documents/${document._id}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
                 window.open(viewUrl, '_blank');
               }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.length === documents.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedDocuments.map((document) => (
                <tr key={document._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(document._id)}
                      onChange={() => handleSelectDocument(document._id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {document.originalName}
                        </div>
                        {document.labValuesCount && (
                          <div className="text-xs text-green-600">
                            {document.labValuesCount} lab values extracted
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                      getCategoryColor(document.category)
                    )}>
                      {document.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {document.fileType ? document.fileType.split('/')[1]?.toUpperCase() || document.fileType : 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {document.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {document.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{document.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(document.fileSize)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(new Date(document.uploadDate))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownloadDocument(document._id, document.originalName)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(document._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Document Card Component for Grid View
function DocumentCard({ 
  document, 
  isSelected, 
  onSelect, 
  onDelete, 
  onDownload,
  onView
}: {
  document: Document;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onView: () => void;
}) {
  return (
    <div className={cn(
      "bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-md",
      isSelected ? "border-primary-500 bg-primary-50" : "border-gray-200"
    )}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <div className="flex items-center space-x-1">
            <button
              onClick={onDownload}
              className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onView}
              className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Icon and Name */}
        <div className="flex items-center mb-3">
          <FileText className="w-10 h-10 text-gray-400 mr-3" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {document.originalName}
            </h3>
            <p className="text-xs text-gray-500">
              {formatFileSize(document.fileSize)} • {document.fileType ? document.fileType.split('/')[1]?.toUpperCase() || document.fileType : 'Unknown'}
            </p>
          </div>
        </div>

        {/* Category */}
        <div className="mb-3">
          <span className={cn(
            "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
            getCategoryColor(document.category)
          )}>
            {document.category}
          </span>
        </div>

        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {document.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                >
                  {tag}
                </span>
              ))}
              {document.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{document.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatDate(new Date(document.uploadDate))}</span>
          {document.labValuesCount && (
            <span className="text-green-600 font-medium">
              {document.labValuesCount} lab values
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
