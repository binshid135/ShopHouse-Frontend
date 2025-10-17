// components/admin/ProductForm.tsx
'use client';
import { useState, useRef } from 'react';
import { Product } from './../../../../lib/types';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Files will be handled by the form submission
    // We just update the preview
    const newImagesPreview: string[] = [];
    for (let i = 0; i < files.length; i++) {
      newImagesPreview.push(URL.createObjectURL(files[i]));
    }
    setImages(prev => [...prev, ...newImagesPreview]);
  };

  const handleRemoveImage = (imageToRemove: string, index: number) => {
    // If it's a new image (blob URL), just remove from preview
    if (imageToRemove.startsWith('blob:')) {
      setImages(prev => prev.filter(img => img !== imageToRemove));
      URL.revokeObjectURL(imageToRemove);
    } else {
      // If it's an existing image, mark for deletion
      setImages(prev => prev.filter(img => img !== imageToRemove));
      setImagesToDelete(prev => [...prev, imageToRemove]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    
    const formData = new FormData(e.currentTarget);
    
    // Append existing images that should be kept
    images.forEach(image => {
      if (!image.startsWith('blob:')) {
        formData.append('existingImages', image);
      }
    });
    
    // Append files for new uploads
    const fileInput = fileInputRef.current;
    if (fileInput?.files) {
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('images', fileInput.files[i]);
      }
    }
    
    // Append deleted images
    if (imagesToDelete.length > 0) {
      formData.append('deletedImages', JSON.stringify(imagesToDelete));
    }
    
    if (product?.id) {
      formData.append('id', product.id);
    }
    
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {product ? 'Edit Product' : 'Add Product'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                name="name"
                required
                defaultValue={product?.name}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Short Description</label>
              <input
                type="text"
                name="shortDescription"
                defaultValue={product?.shortDescription}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Original Price *</label>
              <input
                type="number"
                name="originalPrice"
                required
                step="0.01"
                min="0"
                defaultValue={product?.originalPrice}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Discounted Price *</label>
              <input
                type="number"
                name="discountedPrice"
                required
                step="0.01"
                min="0"
                defaultValue={product?.discountedPrice}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
            
            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image, index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer block"
              >
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    Click to upload images or drag and drop
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG, JPEG up to 5MB each
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}