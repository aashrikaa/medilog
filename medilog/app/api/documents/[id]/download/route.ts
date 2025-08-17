import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Document from '@/models/Document';
import { verifyToken } from '@/lib/auth';
import { downloadFile } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Support token via Authorization header or `?token=` query param for new-tab viewing
    const url = new URL(request.url);
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || url.searchParams.get('token') || undefined;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const document = await Document.findOne({
      _id: params.id,
      userId: decoded.userId,
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Download file from Supabase (returns a Blob in Node 18+)
    const fileData = await downloadFile(document.supabasePath);

    let body: any = fileData as any;
    let size: number | undefined;

    // If Blob, convert to Buffer and read size
    if (fileData && typeof (fileData as any).arrayBuffer === 'function') {
      const blob = fileData as Blob;
      size = blob.size;
      const arrayBuffer = await blob.arrayBuffer();
      body = Buffer.from(arrayBuffer);
    }

    const response = new NextResponse(body);
    response.headers.set('Content-Type', 'application/pdf');
    // Use inline so it can be viewed in-browser; downloads still work via anchor download attribute
    response.headers.set('Content-Disposition', `inline; filename="${document.originalName}"`);
    if (typeof size === 'number') {
      response.headers.set('Content-Length', String(size));
    }
    return response;
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
}
