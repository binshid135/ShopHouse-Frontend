// components/admin/ProductForm.tsx
'use client';
import { useState, useEffect } from 'react';
import { Product } from '../../../../lib/types';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState(product?.name || '');
  const [shortDescription, setShortDescription] = useState(product?.shortDescription || '');
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice.toString() || '');
  const [discountedPrice, setDiscountedPrice] = useState(product?.discountedPrice.toString() || '');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(product?.images || []);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  
  // Recommendation fields
  const [isRecommended, setIsRecommended] = useState(product?.isRecommended || false);
  const [isMostRecommended, setIsMostRecommended] = useState(product?.isMostRecommended || false);
  const [recommendationOrder, setRecommendationOrder] = useState(product?.recommendationOrder || 0);

  // components/admin/ProductForm.tsx - Update handleSubmit function
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // Client-side validation for images
  const totalImages = existingImages.length + images.length - imagesToDelete.length;
  if (totalImages === 0) {
    alert('At least one image is required');
    return;
  }
  
  const formData = new FormData();
  if (product) formData.append('id', product.id);
  formData.append('name', name);
  formData.append('shortDescription', shortDescription);
  formData.append('originalPrice', originalPrice);
  formData.append('discountedPrice', discountedPrice);
  formData.append('isRecommended', isRecommended.toString());
  formData.append('isMostRecommended', isMostRecommended.toString());
  formData.append('recommendationOrder', recommendationOrder.toString());
  
  // Append new images
  images.forEach(image => {
    formData.append('images', image);
  });
  
  // Append images to delete
  if (imagesToDelete.length > 0) {
    formData.append('deletedImages', JSON.stringify(imagesToDelete));
  }
  
  onSubmit(formData);
};

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl: string) => {
    setExistingImages(prev => prev.filter(img => img !== imageUrl));
    setImagesToDelete(prev => [...prev, imageUrl]);
  };

  // Handle recommendation logic
  useEffect(() => {
    if (isMostRecommended) {
      setIsRecommended(true); // Most recommended should also be recommended
      setRecommendationOrder(0); // Most recommended always has order 0
    }
  }, [isMostRecommended]);

  const handleRecommendedChange = (value: boolean) => {
    setIsRecommended(value);
    if (!value) {
      setIsMostRecommended(false); // If not recommended, cannot be most recommended
      setRecommendationOrder(0);
    }
  };

  const handleMostRecommendedChange = (value: boolean) => {
    setIsMostRecommended(value);
    if (value) {
      setIsRecommended(true); // Most recommended implies recommended
      setRecommendationOrder(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discounted Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Recommendation Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Product Recommendations</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isRecommended"
                    checked={isRecommended}
                    onChange={(e) => handleRecommendedChange(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isRecommended" className="ml-2 block text-sm text-gray-900">
                    Mark as Recommended Product
                  </label>
                </div>

                {isRecommended && (
                  <div className="ml-6 space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isMostRecommended"
                        checked={isMostRecommended}
                        onChange={(e) => handleMostRecommendedChange(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isMostRecommended" className="ml-2 block text-sm text-gray-900">
                        Mark as Most Recommended Product
                      </label>
                    </div>

                    {!isMostRecommended && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Recommendation Order (1-3)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="3"
                          value={recommendationOrder}
                          onChange={(e) => setRecommendationOrder(parseInt(e.target.value) || 0)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Order in which recommended products are displayed (1-3)
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Help text */}
              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Recommendation Rules:</strong><br />
                  • Maximum 1 "Most Recommended" product<br />
                  • Maximum 3 "Recommended" products total<br />
                  • "Most Recommended" product will be displayed first<br />
                  • Other recommended products will be ordered by their order number
                </p>
              </div>
            </div>

            {/* Images Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Product Images</h3>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Images
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(image)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add New Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`New ${index + 1}`}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {product ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}