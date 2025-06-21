"use client";

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface ImageGalleryProps {
  images: { url: string; alt: string, dataAiHint?: string }[];
  projectName: string;
}

export function ImageGallery({ images, projectName }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className="text-center p-4 bg-muted rounded-md">No images available for this project.</div>;
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="relative w-full bg-card p-2 rounded-lg shadow-md">
      <Dialog>
        <DialogTrigger asChild>
          <div className="aspect-[16/9] overflow-hidden rounded-md cursor-pointer relative group">
            <Image
              src={images[currentIndex].url}
              alt={`${projectName} - Image ${currentIndex + 1}: ${images[currentIndex].alt}`}
              data-ai-hint={images[currentIndex].dataAiHint}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
            />
             <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-lg font-semibold">View Larger</span>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl p-0 border-0">
            <Image
              src={images[currentIndex].url}
              alt={`${projectName} - Image ${currentIndex + 1}: ${images[currentIndex].alt}`}
              data-ai-hint={images[currentIndex].dataAiHint}
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg object-contain"
            />
        </DialogContent>
      </Dialog>


      {images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/70 hover:bg-background button-hover"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/70 hover:bg-background button-hover"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {images.length > 1 && (
        <div className="mt-2 flex space-x-2 overflow-x-auto p-1 pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`block w-20 h-14 rounded-md overflow-hidden border-2 transition-all ${
                index === currentIndex ? 'border-primary scale-105' : 'border-transparent hover:border-primary/50'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                data-ai-hint={image.dataAiHint}
                width={80}
                height={56}
                objectFit="cover"
                className="w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
       <p className="text-xs text-center text-muted-foreground mt-1">{images[currentIndex].alt} ({currentIndex + 1}/{images.length})</p>
    </div>
  );
}
