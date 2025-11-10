import { NextRequest } from 'next/server';
import { uploadToCloudinary, deleteFromCloudinary } from './cloudinary';

export async function handleFileUploadAndFormData(request: NextRequest): Promise<{
  uploadedImages: string[];
  formData: Record<string, any>;
}> {
  const formData = await request.formData();
  const files = formData.getAll('images') as File[];
  const uploadedImages: string[] = [];

  for (const file of files) {
    if (file && file.size > 0) {
      const imageUrl = await uploadToCloudinary(file);
      uploadedImages.push(imageUrl);
    }
  }

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

export async function deleteUploadedFile(imageUrl: string) {
  await deleteFromCloudinary(imageUrl);
}

export async function ensureUploadDir() {
  // No-op for Cloudinary
}