// lib/upload.ts
import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

const uploadDir = path.join(process.cwd(), 'public/uploads');

export async function ensureUploadDir() {
  await fs.ensureDir(uploadDir);
}

export async function handleFileUploadAndFormData(request: NextRequest): Promise<{
  uploadedImages: string[];
  formData: Record<string, any>;
}> {
  await ensureUploadDir();
  
  const formData = await request.formData();
  const files = formData.getAll('images') as File[];
  const uploadedImages: string[] = [];

  // Process file uploads
  for (const file of files) {
    if (file && file.size > 0) {
      const buffer = await file.arrayBuffer();
      const filename = `${uuidv4()}-${file.name.replace(/\s+/g, '-')}`;
      const filepath = path.join(uploadDir, filename);
      
      await fs.writeFile(filepath, Buffer.from(buffer));
      uploadedImages.push(`/uploads/${filename}`);
    }
  }

  // Extract form data
  const formDataObj: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    if (key !== 'images') {
      formDataObj[key] = value;
    }
  }

  return {
    uploadedImages,
    formData: formDataObj
  };
}

export async function deleteUploadedFile(imagePath: string) {
  try {
    const filename = path.basename(imagePath);
    const filepath = path.join(uploadDir, filename);
    await fs.remove(filepath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}