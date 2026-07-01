import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const filename = `selfies/${user.id}/${timestamp}-${file.name}`;

    const blob = await put(filename, file, {
      access: 'private',
    });

    // For private blobs, return the pathname instead of the URL
    // The client will use /api/file?pathname=... to retrieve it
    return NextResponse.json({
      pathname: blob.pathname,
    });
  } catch (error: any) {
    console.error('[Upload Error]:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
