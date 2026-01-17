'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const productImages = images && images.length > 0 ? images : ['/placeholder.png'];

  const handlePrevious = () => {
    setSelectedImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedImage((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
        <img
          src={productImages[selectedImage]}
          alt={`${productName} - Image ${selectedImage + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Zoom Button */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
        >
          <ZoomIn className="h-5 w-5 text-gray-700" />
        </button>

        {/* Navigation Arrows */}
        {productImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {productImages.length > 1 && (
          <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
            {selectedImage + 1} / {productImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {productImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {productImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === index
                  ? 'border-primary-600 ring-2 ring-primary-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl">
          <div className="relative">
            <img
              src={productImages[selectedImage]}
              alt={`${productName} - Image ${selectedImage + 1}`}
              className="w-full h-auto"
            />
            {productImages.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={handlePrevious}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-600">
                  {selectedImage + 1} / {productImages.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
