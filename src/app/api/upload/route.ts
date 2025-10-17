// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from './../../../../lib/auth';
import { handleFileUploadAndFormData } from './../../../../lib/upload';

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const uploadedImages = await handleFileUploadAndFormData(request);
    return NextResponse.json({ 
      success: true, 
      uploadedImages 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
  }
}