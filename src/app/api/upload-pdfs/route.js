import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { processAndIndexPDFs } from '../../services/ragService';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const uploadedPaths = [];

    // Save files
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const path = join(uploadsDir, file.name);
      
      await writeFile(path, buffer);
      uploadedPaths.push(path);
    }

    // Process and index PDFs
    await processAndIndexPDFs(uploadedPaths);

    return NextResponse.json({
      success: true,
      filesProcessed: files.length,
      message: 'Files uploaded and indexed successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}