import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Document from '@/models/Document';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tags = searchParams.get('tags');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const hasLabValues = searchParams.get('hasLabValues');

    // Build query
    let query: any = { userId: decoded.userId };

    if (category) {
      query.category = category;
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    if (dateFrom || dateTo) {
      query.uploadDate = {};
      if (dateFrom) {
        query.uploadDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.uploadDate.$lte = new Date(dateTo);
      }
    }

    if (hasLabValues === 'true') {
      query.labValues = { $exists: true, $ne: [] };
    }

    // Execute query
    const documents = await Document.find(query)
      .sort({ uploadDate: -1 })
      .populate('labValues', 'name value unit status')
      .lean();

    // Transform data for frontend
    const transformedDocuments = documents.map(doc => ({
      _id: doc._id,
      filename: doc.filename,
      originalName: doc.originalName,
      category: doc.category,
      fileType: doc.fileType,
      tags: doc.tags,
      uploadDate: doc.uploadDate,
      fileSize: doc.fileSize,
      summary: doc.summary,
      labValuesCount: doc.labValues?.length || 0,
    }));

    return NextResponse.json({
      documents: transformedDocuments,
      total: transformedDocuments.length,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
