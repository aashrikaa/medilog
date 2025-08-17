import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pdf from 'pdf-parse';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mammoth from 'mammoth';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Tesseract from 'tesseract.js';
import connectDB from '@/lib/database';
import Document from '@/models/Document';
import LabValue from '@/models/LabValue';
import { uploadFile } from '@/lib/supabase';
import { extractLabValues, generateDocumentSummary, suggestTags } from '@/lib/ai';
import { verifyToken } from '@/lib/auth';

// Supported file types and their MIME types
const SUPPORTED_TYPES = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg'
};

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const tags = formData.get('tags') as string;

    if (!file || !category) {
      return NextResponse.json(
        { error: 'File and category are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!SUPPORTED_TYPES[file.type as keyof typeof SUPPORTED_TYPES]) {
      return NextResponse.json(
        { error: 'Unsupported file type. Supported: PDF, DOCX, TXT, PNG, JPG' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 500 }
      );
    }

    await connectDB();

    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = join(tmpdir(), `${Date.now()}-${file.name}`);
    await writeFile(tempPath, buffer);

    // Extract text based on file type
    let extractedText = '';
    let aiResult: any = { labValues: [], summary: '', confidence: 0, processingTime: 0 };
    let summary = '';
    let suggestedTags: string[] = [];

    if (category === 'Lab Reports') {
      try {
        // Extract text based on file type
        if (file.type === 'application/pdf') {
          const pdfData = await pdf(buffer);
          extractedText = pdfData.text;
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // Extract text from DOCX files
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value;
        } else if (file.type === 'text/plain') {
          // For TXT files, read directly
          extractedText = buffer.toString('utf-8');
        } else if (file.type.startsWith('image/')) {
          // Extract text from images using OCR
          const { data: { text } } = await Tesseract.recognize(buffer, 'eng', {
            logger: (m: any) => console.log(m)
          });
          extractedText = text;
        }
      } catch (error) {
        console.error('Text extraction error:', error);
        extractedText = '';
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${decoded.userId}-${timestamp}-${file.name}`;
    // Store files under a per-user folder so policies (and organization) work as expected
    const supabasePath = `${decoded.userId}/${filename}`;

    // Upload to Supabase
    await uploadFile(file, supabasePath);

    // AI processing only for Lab Reports
    if (category === 'Lab Reports' && extractedText) {
      try {
        console.log('Starting AI processing for Lab Report...');
        console.log('Extracted text length:', extractedText.length);
        
        [aiResult, summary, suggestedTags] = await Promise.all([
          extractLabValues(extractedText),
          generateDocumentSummary(extractedText),
          suggestTags(extractedText),
        ]);
        
        console.log('AI processing completed:');
        console.log('- Lab values found:', aiResult.labValues.length);
        console.log('- Summary generated:', !!summary);
        console.log('- Tags suggested:', suggestedTags.length);
        
      } catch (error) {
        console.error('AI processing error:', error);
        // Continue with upload even if AI fails
      }
    } else {
      console.log('Skipping AI processing:', {
        category,
        hasExtractedText: !!extractedText,
        extractedTextLength: extractedText?.length || 0
      });
    }

    // Parse tags and combine with AI suggestions for Lab Reports
    const parsedTags = tags ? tags.split(',').map(t => t.trim()) : [];
    const finalTags = category === 'Lab Reports' 
      ? Array.from(new Set([...parsedTags, ...suggestedTags]))
      : parsedTags;

    // Create document record
    const document = new Document({
      userId: decoded.userId,
      filename,
      originalName: file.name,
      fileSize: file.size,
      fileType: file.type,
      category,
      tags: finalTags,
      supabasePath,
      extractedText,
      summary,
      uploadDate: new Date(),
    });

    await document.save();

    // Create lab value records only for Lab Reports with extracted values
    if (category === 'Lab Reports' && aiResult.labValues.length > 0) {
      try {
        console.log('Saving lab values...');
        console.log('Lab values to save:', aiResult.labValues.length);
        
        const labValues = aiResult.labValues.map((lv: any) => ({
          ...lv,
          documentId: document._id,
        }));

        const savedLabValues = await LabValue.insertMany(labValues, { ordered: false });
        console.log('Lab values saved successfully:', savedLabValues.length);
        
        // Update document with lab value references
        document.labValues = savedLabValues.map(lv => lv._id);
        await document.save();
        console.log('Document updated with lab value references');
      } catch (error) {
        console.error('Error saving lab values:', error);
        // Continue even if lab values fail to save
      }
    } else {
      console.log('No lab values to save:', {
        category,
        labValuesCount: aiResult.labValues.length
      });
    }

    // Clean up temp file
    try {
      await writeFile(tempPath, '');
    } catch (error) {
      console.error('Failed to clean up temp file:', error);
    }

    return NextResponse.json({
      message: 'Document uploaded successfully',
      document: {
        _id: document._id,
        filename: document.filename,
        originalName: document.originalName,
        category: document.category,
        tags: document.tags,
        summary: document.summary,
        labValuesCount: aiResult.labValues.length,
        uploadDate: document.uploadDate,
      },
      aiResult,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
