import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'gallery');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

async function ensureUploadDir() {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
}

function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, extension);
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${timestamp}_${randomString}_${sanitizedName}${extension}`;
}

function isValidFileType(file: File): { valid: boolean; type: 'image' | 'video' | null } {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: true, type: 'image' };
  }
  
  if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return { valid: true, type: 'video' };
  }
  
  return { valid: false, type: null };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const { valid, type } = isValidFileType(file);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, MOV) are allowed.' },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    await ensureUploadDir();

    // Generate unique filename
    const fileName = generateFileName(file.name);
    const filePath = path.join(UPLOADS_DIR, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    // Return the file URL and metadata
    const fileUrl = `/uploads/gallery/${fileName}`;
    
    return NextResponse.json({
      success: true,
      url: fileUrl,
      type,
      originalName: file.name,
      size: file.size,
      fileName
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// GET endpoint to list uploaded files
export async function GET() {
  try {
    const { readdir, stat } = await import('fs/promises');
    
    if (!existsSync(UPLOADS_DIR)) {
      return NextResponse.json({
        success: true,
        files: []
      });
    }

    const files = await readdir(UPLOADS_DIR);
    const fileDetails = await Promise.all(
      files.map(async (fileName) => {
        const filePath = path.join(UPLOADS_DIR, fileName);
        const stats = await stat(filePath);
        const extension = path.extname(fileName).toLowerCase();
        
        let type: 'image' | 'video' = 'image';
        if (['.mp4', '.webm', '.mov'].includes(extension)) {
          type = 'video';
        }
        
        return {
          fileName,
          url: `/uploads/gallery/${fileName}`,
          size: stats.size,
          type,
          uploadedAt: stats.birthtime.toISOString()
        };
      })
    );

    return NextResponse.json({
      success: true,
      files: fileDetails.sort((a, b) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )
    });

  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
