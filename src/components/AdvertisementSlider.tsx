import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Advertisement {
  id: string;
  type: "image" | "video";
  url: string;
  link?: string;
  title?: string;
}

interface AdvertisementSliderProps {
  advertisements: Advertisement[];
}

const AdvertisementSlider = ({ advertisements }: AdvertisementSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || advertisements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % advertisements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, advertisements.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + advertisements.length) % advertisements.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % advertisements.length);
    setIsAutoPlaying(false);
  };

  const handleAdClick = (link?: string) => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  if (advertisements.length === 0) {
    return null;
  }

  const currentAd = advertisements[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-card bg-card">
      {/* Main content area */}
      <div
        className="relative aspect-[16/9] md:aspect-[21/9] cursor-pointer"
        onClick={() => handleAdClick(currentAd.link)}
      >
        {currentAd.type === "image" ? (
          <img
            src={currentAd.url}
            alt={currentAd.title || "Advertisement"}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
        ) : (
          <video
            src={currentAd.url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent pointer-events-none" />

        {/* Title overlay */}
        {currentAd.title && (
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-primary-foreground font-medium text-sm md:text-base line-clamp-2 drop-shadow-lg">
              {currentAd.title}
            </p>
          </div>
        )}
      </div>

      {/* Navigation arrows - visible on desktop, touch-swipe on mobile */}
      {advertisements.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 md:h-10 md:w-10 rounded-full bg-card/80 hover:bg-card shadow-soft hidden md:flex"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 md:h-10 md:w-10 rounded-full bg-card/80 hover:bg-card shadow-soft hidden md:flex"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {advertisements.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {advertisements.map((_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-6 bg-primary-foreground"
                  : "w-1.5 bg-primary-foreground/50 hover:bg-primary-foreground/70"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvertisementSlider;
