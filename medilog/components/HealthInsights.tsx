'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  FileText, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { cn, getStatusColor } from '@/lib/utils';

interface Document {
  _id: string;
  filename: string;
  originalName: string;
  category: string;
  tags: string[];
  uploadDate: string;
  fileSize: number;
  summary?: string;
  labValuesCount?: number;
}

interface LabValue {
  _id: string;
  name: string;
  value: number;
  unit: string;
  referenceRange?: {
    min: number;
    max: number;
  };
  status: 'normal' | 'high' | 'low' | 'critical';
  confidence: number;
  extractedDate: string;
  documentId: string;
}

interface HealthInsightsProps {
  documents: Document[];
}

export default function HealthInsights({ documents }: HealthInsightsProps) {
  const [labValues, setLabValues] = useState<LabValue[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLabValues();
  }, [documents]);

  const fetchLabValues = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/lab-values', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLabValues(data.labValues);
      }
    } catch (error) {
      console.error('Error fetching lab values:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group lab values by document
  const getLabValuesByDocument = () => {
    const grouped: { [documentId: string]: { document: Document; labValues: LabValue[] } } = {};
    
    labValues.forEach(labValue => {
      const document = documents.find(doc => doc._id === labValue.documentId);
      if (document) {
        if (!grouped[document._id]) {
          grouped[document._id] = { document, labValues: [] };
        }
        grouped[document._id].labValues.push(labValue);
      }
    });

    return Object.values(grouped).sort((a, b) => 
      new Date(b.document.uploadDate).getTime() - new Date(a.document.uploadDate).getTime()
    );
  };

  // Normalize test names to group similar tests together
  const normalizeTestName = (testName: string): string => {
    const normalized = testName.toLowerCase().trim();
    
    // Common test name mappings
    const testMappings: { [key: string]: string } = {
      // Hemoglobin variations
      'hb': 'hemoglobin',
      'hgb': 'hemoglobin',
      'haemoglobin': 'hemoglobin',
      'hemoglobin': 'hemoglobin',
      
      // White Blood Cell variations
      'wbc': 'white blood cells',
      'white blood cell count': 'white blood cells',
      'leukocytes': 'white blood cells',
      
      // Red Blood Cell variations
      'rbc': 'red blood cells',
      'red blood cell count': 'red blood cells',
      'erythrocytes': 'red blood cells',
      
      // Platelet variations
      'plt': 'platelets',
      'platelet count': 'platelets',
      'thrombocytes': 'platelets',
      
      // Blood Sugar variations
      'glucose': 'blood glucose',
      'blood sugar': 'blood glucose',
      'bs': 'blood glucose',
      'fbs': 'fasting blood glucose',
      'fasting glucose': 'fasting blood glucose',
      
      // Cholesterol variations
      'hdl': 'hdl cholesterol',
      'ldl': 'ldl cholesterol',
      'total cholesterol': 'cholesterol',
      'chol': 'cholesterol',
      
      // Kidney function variations
      'creatinine': 'serum creatinine',
      'creat': 'serum creatinine',
      'bun': 'blood urea nitrogen',
      'urea': 'blood urea nitrogen',
      
      // Liver function variations
      'alt': 'alanine aminotransferase',
      'sgot': 'aspartate aminotransferase',
      'ast': 'aspartate aminotransferase',
      'alkaline phosphatase': 'alp',
      'alp': 'alkaline phosphatase',
      
      // Thyroid variations
      'tsh': 'thyroid stimulating hormone',
      't3': 'triiodothyronine',
      't4': 'thyroxine',
      'free t3': 'free triiodothyronine',
      'free t4': 'free thyroxine',
      
      // Electrolyte variations
      'na': 'sodium',
      'k': 'potassium',
      'cl': 'chloride',
      'co2': 'bicarbonate',
      'hco3': 'bicarbonate',
      
      // Protein variations
      'alb': 'albumin',
      'albumin': 'albumin',
      'total protein': 'protein',
      'tp': 'protein',
      
      // Iron variations
      'iron': 'serum iron',
      'fe': 'serum iron',
      'tibc': 'total iron binding capacity',
      'ferritin': 'ferritin',
      
      // Vitamin variations
      'vitamin d': 'vitamin d',
      'vit d': 'vitamin d',
      '25-oh vitamin d': 'vitamin d',
      'b12': 'vitamin b12',
      'vitamin b12': 'vitamin b12',
      'folate': 'folic acid',
      'folic acid': 'folic acid',
    };

    // Check if the normalized name matches any known variations
    for (const [variation, standardName] of Object.entries(testMappings)) {
      if (normalized.includes(variation) || variation.includes(normalized)) {
        return standardName;
      }
    }

    // If no exact match, try partial matching for common patterns
    if (normalized.includes('hemoglobin') || normalized.includes('hb')) return 'hemoglobin';
    if (normalized.includes('glucose') || normalized.includes('sugar')) return 'blood glucose';
    if (normalized.includes('cholesterol') || normalized.includes('chol')) return 'cholesterol';
    if (normalized.includes('creatinine') || normalized.includes('creat')) return 'serum creatinine';
    if (normalized.includes('protein') || normalized.includes('alb')) return 'protein';
    if (normalized.includes('iron') || normalized.includes('fe')) return 'serum iron';

    // Return the original name if no normalization found
    return testName;
  };

  // Get normalized test names for the dropdown
  const getNormalizedTestNames = () => {
    const normalizedMap = new Map<string, string[]>();
    
    labValues.forEach(labValue => {
      const normalized = normalizeTestName(labValue.name);
      if (!normalizedMap.has(normalized)) {
        normalizedMap.set(normalized, []);
      }
      normalizedMap.get(normalized)!.push(labValue.name);
    });

    return Array.from(normalizedMap.entries()).map(([normalized, variations]) => ({
      normalized,
      variations,
      displayName: variations.length > 1 
        ? `${normalized} (${variations.join(', ')})`
        : normalized
    }));
  };

  // Analyze test trends and provide insights
  const analyzeTestTrends = (testName: string) => {
    const trends = getTestTrends(testName);
    if (trends.length < 2) return null;

    const values = trends.map(t => t.value);
    const statuses = trends.map(t => t.status);
    
    // Calculate basic statistics
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const range = max - min;
    const change = values[values.length - 1] - values[0];
    const changePercent = ((change / values[0]) * 100).toFixed(1);

    // Determine trend direction
    let trendDirection = 'stable';
    let trendDescription = '';
    let trendColor = 'text-gray-600';
    
    const changePercentNum = parseFloat(changePercent);
    
    if (Math.abs(changePercentNum) < 5) {
      trendDirection = 'stable';
      trendDescription = 'Your values have remained relatively stable';
      trendColor = 'text-green-600';
    } else if (change > 0) {
      trendDirection = 'increasing';
      trendDescription = `Your values have increased by ${changePercent}%`;
      trendColor = 'text-orange-600';
    } else {
      trendDirection = 'decreasing';
      trendDescription = `Your values have decreased by ${changePercent}%`;
      trendColor = 'text-blue-600';
    }

    // Analyze status changes
    const normalCount = statuses.filter(s => s === 'normal').length;
    const abnormalCount = statuses.filter(s => s !== 'normal').length;
    const statusChange = statuses[0] !== statuses[statuses.length - 1];

    // Generate insights
    const insights = [];
    if (statusChange) {
      if (statuses[0] === 'normal' && statuses[statuses.length - 1] !== 'normal') {
        insights.push('⚠️ Your values have moved outside the normal range');
      } else if (statuses[0] !== 'normal' && statuses[statuses.length - 1] === 'normal') {
        insights.push('✅ Your values have returned to normal range');
      } else {
        insights.push('🔄 Your values have changed status categories');
      }
    }

    if (range > avg * 0.3) {
      insights.push('📊 Your values show significant variability');
    }

    if (abnormalCount > normalCount) {
      insights.push('⚠️ Most of your recent values are outside normal range');
    }

    // Get reference ranges for context
    const referenceRanges = trends
      .map(t => t.referenceRange)
      .filter((r): r is { min: number; max: number } => r !== undefined)
      .map(r => `${r.min}-${r.max}`);

    return {
      trends,
      statistics: { min, max, avg: avg.toFixed(1), range: range.toFixed(1), change, changePercent },
      trendDirection,
      trendDescription,
      trendColor,
      statusAnalysis: { normalCount, abnormalCount, statusChange },
      insights,
      referenceRanges: Array.from(new Set(referenceRanges))
    };
  };

  const getTestTrends = (testName: string) => {
    // Find all lab values that match the normalized test name
    const normalizedTestName = normalizeTestName(testName);
    const testValues = labValues
      .filter(lv => normalizeTestName(lv.name) === normalizedTestName)
      .map(lv => {
        const document = documents.find(doc => doc._id === lv.documentId);
        return {
          documentName: document?.originalName || 'Unknown Document',
          value: lv.value,
          status: lv.status,
          date: new Date(lv.extractedDate).getTime(),
          originalTestName: lv.name,
          referenceRange: lv.referenceRange,
          unit: lv.unit,
        };
      })
      .sort((a, b) => a.date - b.date)
      .map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString(),
      }));

    return testValues;
  };

  const getAbnormalValues = () => {
    return labValues.filter(lv => lv.status !== 'normal');
  };

  const getRecentTests = () => {
    return labValues
      .sort((a, b) => new Date(b.extractedDate).getTime() - new Date(a.extractedDate).getTime())
      .slice(0, 10);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'high':
      case 'low':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading health insights...</p>
      </div>
    );
  }

  if (labValues.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No lab values yet</h3>
        <p className="text-gray-600">
          Upload lab reports to start seeing AI-powered health insights and trends.
        </p>
      </div>
    );
  }

  const labValuesByDocument = getLabValuesByDocument();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900">{labValues.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Normal Results</p>
              <p className="text-2xl font-bold text-gray-900">
                {labValues.filter(lv => lv.status === 'normal').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Abnormal Results</p>
              <p className="text-2xl font-bold text-gray-900">
                {getAbnormalValues().length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900">
                {labValuesByDocument.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lab Values by Document */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Lab Values by Document</h3>
        
        {labValuesByDocument.map(({ document, labValues: docLabValues }) => (
          <div key={document._id} className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{document.originalName}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(document.uploadDate).toLocaleDateString()} • {docLabValues.length} test(s)
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">{document.category}</span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {docLabValues.map((labValue) => (
                    <tr key={labValue._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {labValue.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {labValue.value} {labValue.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {labValue.referenceRange 
                            ? `${labValue.referenceRange.min} - ${labValue.referenceRange.max} ${labValue.unit}`
                            : 'N/A'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(labValue.status)}
                          <span className={cn(
                            "ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                            getStatusColor(labValue.status)
                          )}>
                            {labValue.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Test Trends */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Test Trends Across Documents</h3>
          <p className="text-sm text-gray-600 mt-1">
            Select a test to view its progression across different documents
          </p>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="testSelect" className="block text-sm font-medium text-gray-700 mb-2">
              Select Test
            </label>
            <select
              id="testSelect"
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">Choose a test...</option>
              {getNormalizedTestNames().map(({ normalized, displayName }) => (
                <option key={normalized} value={normalized}>{displayName}</option>
              ))}
            </select>
          </div>

          {selectedTest && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">{selectedTest}</h4>
                <span className="text-sm text-gray-500">
                  {getTestTrends(selectedTest).length} measurements
                </span>
              </div>

              {/* Enhanced Trend Analysis */}
              {(() => {
                const analysis = analyzeTestTrends(selectedTest);
                if (!analysis) return null;
                
                return (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <h5 className="font-medium text-blue-900 mb-4 text-lg">📊 Comprehensive Trend Analysis</h5>
                    
                    {/* Enhanced Summary Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{analysis.statistics.min}</div>
                        <div className="text-xs text-blue-700 font-medium">Minimum</div>
                        <div className="text-xs text-gray-500">Lowest value</div>
                      </div>
                      <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{analysis.statistics.max}</div>
                        <div className="text-xs text-blue-700 font-medium">Maximum</div>
                        <div className="text-xs text-gray-500">Highest value</div>
                      </div>
                      <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{analysis.statistics.avg}</div>
                        <div className="text-xs text-blue-700 font-medium">Average</div>
                        <div className="text-xs text-gray-500">Mean value</div>
                      </div>
                      <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{analysis.statistics.range}</div>
                        <div className="text-xs text-blue-700 font-medium">Range</div>
                        <div className="text-xs text-gray-500">Variability</div>
                      </div>
                      <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                        <div className={`text-2xl font-bold ${analysis.trendColor}`}>
                          {analysis.statistics.change > 0 ? '+' : ''}{analysis.statistics.changePercent}%
                        </div>
                        <div className="text-xs text-blue-700 font-medium">Total Change</div>
                        <div className="text-xs text-gray-500">From first to last</div>
                      </div>
                    </div>

                    {/* Enhanced Trend Direction with Visual Indicators */}
                    <div className="bg-white rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="font-medium text-gray-900">Trend Direction</h6>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          analysis.trendDirection === 'stable' ? 'bg-green-100 text-green-800' :
                          analysis.trendDirection === 'increasing' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {analysis.trendDirection.toUpperCase()}
                        </div>
                      </div>
                      <div className={`text-lg font-medium ${analysis.trendColor} mb-2`}>
                        {analysis.trendDescription}
                      </div>
                      <div className="text-sm text-gray-600">
                        {analysis.trendDirection === 'stable' && 'Your values are within normal fluctuation range'}
                        {analysis.trendDirection === 'increasing' && 'Monitor for continued upward trends'}
                        {analysis.trendDirection === 'decreasing' && 'Monitor for continued downward trends'}
                      </div>
                    </div>

                    {/* Enhanced Status Analysis */}
                    <div className="bg-white rounded-lg p-4 mb-6">
                      <h6 className="font-medium text-gray-900 mb-3">Status Distribution & Changes</h6>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{analysis.statusAnalysis.normalCount}</div>
                          <div className="text-sm text-green-700">Normal Results</div>
                          <div className="text-xs text-gray-500">
                            {((analysis.statusAnalysis.normalCount / (analysis.statusAnalysis.normalCount + analysis.statusAnalysis.abnormalCount)) * 100).toFixed(0)}% of total
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{analysis.statusAnalysis.abnormalCount}</div>
                          <div className="text-sm text-yellow-700">Abnormal Results</div>
                          <div className="text-xs text-gray-500">
                            {((analysis.statusAnalysis.abnormalCount / (analysis.statusAnalysis.normalCount + analysis.statusAnalysis.abnormalCount)) * 100).toFixed(0)}% of total
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${analysis.statusAnalysis.statusChange ? 'text-orange-600' : 'text-gray-600'}`}>
                            {analysis.statusAnalysis.statusChange ? 'Yes' : 'No'}
                          </div>
                          <div className="text-sm text-gray-700">Status Changed</div>
                          <div className="text-xs text-gray-500">
                            {analysis.statusAnalysis.statusChange ? 'Values moved between categories' : 'Values remained in same category'}
                          </div>
                        </div>
                      </div>
                      {analysis.statusAnalysis.statusChange && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="text-sm text-orange-800 font-medium">
                            ⚠️ Status Change Detected
                          </div>
                          <div className="text-xs text-orange-700 mt-1">
                            Your test status has changed over time. This could indicate improving or worsening health conditions.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Key Insights */}
                    {analysis.insights.length > 0 && (
                      <div className="bg-white rounded-lg p-4 mb-6">
                        <h6 className="font-medium text-gray-900 mb-3">🔍 Key Insights & Recommendations</h6>
                        <div className="space-y-3">
                          {analysis.insights.map((insight, index) => (
                            <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                              <span className="mr-3 text-lg">•</span>
                              <div>
                                <div className="text-sm text-gray-800 font-medium">{insight}</div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {insight.includes('outside normal range') && 'Consider consulting your healthcare provider'}
                                  {insight.includes('returned to normal') && 'Great progress! Continue monitoring'}
                                  {insight.includes('significant variability') && 'High variability may indicate need for lifestyle changes'}
                                  {insight.includes('most recent values abnormal') && 'Schedule a follow-up with your doctor'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reference Ranges with Context */}
                    {analysis.referenceRanges.length > 0 && (
                      <div className="bg-white rounded-lg p-4">
                        <h6 className="font-medium text-gray-900 mb-3">📋 Reference Ranges & Context</h6>
                        <div className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">Normal Range:</span> {analysis.referenceRanges.join(', ')}
                        </div>
                        <div className="text-xs text-gray-500">
                          These ranges represent the expected values for healthy individuals. Values outside this range may require medical attention.
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
              
              {/* Modern Professional Line Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h5 className="font-medium text-gray-900 text-lg">📊 Professional Trend Analysis</h5>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      Trend Line
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      Normal Values
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      Abnormal Values
                    </div>
                  </div>
                </div>
                
                {/* Chart Container with Grid */}
                <div className="relative bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-200 p-6">
                  {/* Y-axis with grid lines */}
                  <div className="absolute left-0 top-0 bottom-0 w-16">
                    {(() => {
                      const trends = getTestTrends(selectedTest);
                      const values = trends.map(t => t.value);
                      const max = Math.max(...values);
                      const min = Math.min(...values);
                      const range = max - min;
                      const step = range / 4;
                      
                      return [max, max - step, max - step * 2, max - step * 3, min].map((value, i) => (
                        <div key={i} className="absolute w-full flex items-center" style={{ top: `${(i / 4) * 100}%` }}>
                          <div className="w-full h-px bg-gray-200"></div>
                          <div className="absolute right-2 text-xs text-gray-500 font-medium bg-white px-1">
                            {value.toFixed(1)}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                  
                  {/* Main Chart Area */}
                  <div className="ml-16 h-80 relative">
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-0">
                      {(() => {
                        const trends = getTestTrends(selectedTest);
                        const values = trends.map(t => t.value);
                        const max = Math.max(...values);
                        const min = Math.min(...values);
                        const range = max - min;
                        const step = range / 4;
                        
                        return [max, max - step, max - step * 2, max - step * 3, min].map((value, i) => (
                          <div key={i} className="absolute w-full h-px bg-gray-100" style={{ top: `${(i / 4) * 100}%` }}></div>
                        ));
                      })()}
                    </div>
                    
                    {/* Data visualization */}
                    {(() => {
                      const trends = getTestTrends(selectedTest);
                      if (trends.length === 0) return null;
                      
                      const values = trends.map(t => t.value);
                      const max = Math.max(...values);
                      const min = Math.min(...values);
                      const range = max - min;
                      
                      // Calculate positions for data points
                      const points = trends.map((trend, index) => {
                        const x = (index / (trends.length - 1)) * 100;
                        const y = range === 0 ? 50 : 100 - ((trend.value - min) / range) * 100;
                        return { x, y, trend };
                      });
                      
                      // Create SVG path for trend line
                      const pathData = points.map((point, index) => 
                        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                      ).join(' ');
                      
                      return (
                        <>
                          {/* Trend Line with Area Fill */}
                          <svg className="absolute inset-0 w-full h-full" style={{ top: '-1px' }}>
                            {/* Area under the line */}
                            <path
                              d={`${pathData} L 100 100 L 0 100 Z`}
                              fill="url(#areaGradient)"
                              opacity="0.1"
                            />
                            
                            {/* Main trend line */}
                            <path
                              d={pathData}
                              stroke="#3B82F6"
                              strokeWidth="3"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="drop-shadow-sm"
                            />
                            
                            {/* Gradient definitions */}
                            <defs>
                              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05"/>
                              </linearGradient>
                            </defs>
                          </svg>
                          
                          {/* Data Points */}
                          {points.map((point, index) => (
                            <div
                              key={index}
                              className="absolute w-5 h-5 rounded-full border-3 border-white shadow-lg cursor-pointer group transition-all duration-200 hover:scale-125"
                              style={{
                                left: `${point.x}%`,
                                top: `${point.y}%`,
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: point.trend.status === 'normal' ? '#10B981' : '#F59E0B'
                              }}
                            >
                              {/* Hover Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                <div className="bg-gray-900 text-white text-xs rounded-lg py-3 px-4 whitespace-nowrap shadow-2xl border border-gray-700">
                                  <div className="font-bold text-lg">{point.trend.value} {point.trend.unit}</div>
                                  <div className="text-gray-300 mt-1">{point.trend.documentName.split('.')[0]}</div>
                                  <div className="text-gray-300">{point.trend.date}</div>
                                  <div className="text-center mt-2">
                                    <span className={`inline-block w-3 h-3 rounded-full ${
                                      point.trend.status === 'normal' ? 'bg-green-400' : 'bg-yellow-400'
                                    }`}></span>
                                    <span className="ml-2 text-sm font-medium">{point.trend.status}</span>
                                  </div>
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          ))}
                          
                          {/* X-axis labels */}
                          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
                            {trends.map((trend, index) => (
                              <div key={index} className="text-center transform -translate-x-1/2" style={{ left: `${(index / (trends.length - 1)) * 100}%` }}>
                                <div className="font-medium truncate max-w-24" title={trend.documentName}>
                                  {trend.documentName.split('.')[0]}
                                </div>
                                <div className="text-gray-400 mt-1">{trend.date}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* Chart Legend */}
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center space-x-8 text-sm text-gray-600">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                        <span>Trend Line</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                        <span>Normal Values</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                        <span>Abnormal Values</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-400">
                      Hover over data points for detailed information • Values shown left to right by date
                    </div>
                  </div>
                </div>
              </div>

              {/* Trend Pattern Analysis */}
              {(() => {
                const analysis = analyzeTestTrends(selectedTest);
                if (!analysis || analysis.trends.length < 3) return null;
                
                const trends = analysis.trends;
                const values = trends.map(t => t.value);
                
                // Detect patterns
                const avgValue = parseFloat(analysis.statistics.avg);
                const rangeValue = parseFloat(analysis.statistics.range);
                const isConsistent = rangeValue < avgValue * 0.2;
                const hasSpikes = values.some((v, i) => i > 0 && Math.abs(v - values[i-1]) > avgValue * 0.3);
                const isGradual = Math.abs(analysis.statistics.change) < avgValue * 0.5;
                
                return (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                    <h5 className="font-medium text-purple-900 mb-4">🔍 Trend Pattern Analysis</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                        <div className={`text-2xl font-bold ${isConsistent ? 'text-green-600' : 'text-orange-600'}`}>
                          {isConsistent ? '✓' : '⚠️'}
                        </div>
                        <div className="text-sm font-medium text-gray-900">Consistency</div>
                        <div className="text-xs text-gray-500">
                          {isConsistent ? 'Values are stable' : 'Values show variation'}
                        </div>
                      </div>
                      
                      <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                        <div className={`text-2xl font-bold ${!hasSpikes ? 'text-green-600' : 'text-orange-600'}`}>
                          {!hasSpikes ? '✓' : '⚠️'}
                        </div>
                        <div className="text-sm font-medium text-gray-900">Stability</div>
                        <div className="text-xs text-gray-500">
                          {!hasSpikes ? 'No sudden changes' : 'Sudden spikes detected'}
                        </div>
                      </div>
                      
                      <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                        <div className={`text-2xl font-bold ${isGradual ? 'text-green-600' : 'text-orange-600'}`}>
                          {isGradual ? '✓' : '⚠️'}
                        </div>
                        <div className="text-sm font-medium text-gray-900">Progression</div>
                        <div className="text-xs text-gray-500">
                          {isGradual ? 'Gradual changes' : 'Rapid changes'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4">
                      <h6 className="font-medium text-gray-900 mb-2">Pattern Summary</h6>
                      <div className="text-sm text-gray-700 space-y-1">
                        {isConsistent && <div>• Your values show good consistency over time</div>}
                        {!isConsistent && <div>• Your values show some variability - this is normal for many tests</div>}
                        {hasSpikes && <div>• Sudden changes detected - consider what might have caused these</div>}
                        {!hasSpikes && <div>• No sudden spikes - your values change gradually</div>}
                        {isGradual && <div>• Changes are gradual, suggesting stable health trends</div>}
                        {!isGradual && <div>• Rapid changes detected - monitor closely</div>}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Risk Assessment & Recommendations */}
              {(() => {
                const analysis = analyzeTestTrends(selectedTest);
                if (!analysis) return null;
                
                // Calculate risk level
                let riskLevel = 'low';
                let riskColor = 'text-green-600';
                let riskBg = 'bg-green-50';
                let riskBorder = 'border-green-200';
                
                if (analysis.statusAnalysis.abnormalCount > analysis.statusAnalysis.normalCount) {
                  riskLevel = 'high';
                  riskColor = 'text-red-600';
                  riskBg = 'bg-red-50';
                  riskBorder = 'border-red-200';
                } else if (analysis.statusAnalysis.abnormalCount > 0 || Math.abs(parseFloat(analysis.statistics.changePercent)) > 20) {
                  riskLevel = 'medium';
                  riskColor = 'text-yellow-600';
                  riskBg = 'bg-yellow-50';
                  riskBorder = 'border-yellow-200';
                }
                
                return (
                  <div className={`${riskBg} border ${riskBorder} rounded-lg p-6`}>
                    <h5 className={`font-medium ${riskColor} mb-4 text-lg`}>⚠️ Risk Assessment & Action Plan</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h6 className="font-medium text-gray-900 mb-3">Risk Level</h6>
                        <div className={`text-3xl font-bold ${riskColor} mb-2`}>
                          {riskLevel.toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {riskLevel === 'low' && 'Your values are generally stable and within normal ranges'}
                          {riskLevel === 'medium' && 'Some values are outside normal ranges - monitor closely'}
                          {riskLevel === 'high' && 'Multiple abnormal values detected - consider medical consultation'}
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h6 className="font-medium text-gray-900 mb-3">Recommended Actions</h6>
                        <div className="space-y-2 text-sm text-gray-700">
                          {riskLevel === 'low' && (
                            <>
                              <div>• Continue regular monitoring</div>
                              <div>• Maintain current lifestyle habits</div>
                              <div>• Schedule routine check-ups</div>
                            </>
                          )}
                          {riskLevel === 'medium' && (
                            <>
                              <div>• Monitor values more frequently</div>
                              <div>• Consider lifestyle modifications</div>
                              <div>• Schedule follow-up testing</div>
                            </>
                          )}
                          {riskLevel === 'high' && (
                            <>
                              <div>• Consult healthcare provider soon</div>
                              <div>• Consider immediate lifestyle changes</div>
                              <div>• Schedule comprehensive evaluation</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Abnormal Values Alert */}
      {getAbnormalValues().length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-yellow-900 mb-2">
                Abnormal Lab Values Detected
              </h3>
              <p className="text-yellow-800 mb-4">
                {getAbnormalValues().length} test result(s) are outside the normal range. 
                Please consult with your healthcare provider for interpretation.
              </p>
              <div className="space-y-2">
                {getAbnormalValues().slice(0, 5).map((labValue) => {
                  const document = documents.find(doc => doc._id === labValue.documentId);
                  return (
                    <div key={labValue._id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-yellow-800 font-medium">{labValue.name}</span>
                        <span className="text-yellow-700 ml-2">({document?.originalName || 'Unknown'})</span>
                      </div>
                      <span className={cn(
                        "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                        getStatusColor(labValue.status)
                      )}>
                        {labValue.status} ({labValue.value} {labValue.unit})
                      </span>
                    </div>
                  );
                })}
                {getAbnormalValues().length > 5 && (
                  <p className="text-xs text-yellow-700">
                    +{getAbnormalValues().length - 5} more abnormal values
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Summary */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">AI-Generated Health Summary</h3>
        </div>
        <div className="p-6">
          {documents.some(doc => doc.summary) ? (
            <div className="space-y-4">
              {documents
                .filter(doc => doc.summary)
                .slice(0, 3)
                .map((doc) => (
                  <div key={doc._id} className="border-l-4 border-primary-500 pl-4">
                    <div className="flex items-center mb-2">
                      <FileText className="w-4 h-4 text-primary-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {doc.originalName}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{doc.summary}</p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No health summaries available yet. Upload more documents to generate AI insights.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
