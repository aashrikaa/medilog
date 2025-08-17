import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Document from '@/models/Document';
import LabValue from '@/models/LabValue';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
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
    const testName = searchParams.get('testName');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build query to get lab values from user's documents
    const documents = await Document.find({ userId: decoded.userId }).select('_id');
    const documentIds = documents.map(doc => doc._id);

    console.log('User documents found:', documentIds.length);
    console.log('Document IDs:', documentIds);

    let query: any = { documentId: { $in: documentIds } };

    if (testName) {
      query.name = { $regex: testName, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    if (dateFrom || dateTo) {
      query.extractedDate = {};
      if (dateFrom) {
        query.extractedDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.extractedDate.$lte = new Date(dateTo);
      }
    }

    console.log('Lab values query:', JSON.stringify(query, null, 2));

    // Execute query
    const labValues = await LabValue.find(query)
      .sort({ extractedDate: -1 })
      .lean();

    console.log('Lab values found:', labValues.length);

    return NextResponse.json({
      labValues,
      total: labValues.length,
    });
  } catch (error) {
    console.error('Error fetching lab values:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab values' },
      { status: 500 }
    );
  }
}
