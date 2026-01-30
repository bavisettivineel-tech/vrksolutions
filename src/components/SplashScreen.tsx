import { useEffect, useState } from "react";
import vrkLogo from "@/assets/vrk-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-vrk-100 animate-pulse-soft" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-vrk-50 animate-pulse-soft" style={{ animationDelay: "1s" }} />
      </div>

      {/* Logo and content */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="animate-scale-in">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-vrk-200 rounded-full scale-110" />
            <img
              src={vrkLogo}
              alt="VRK Solutions Logo"
              className="relative h-32 w-32 md:h-40 md:w-40 object-contain animate-float"
            />
          </div>
        </div>

        <div className="mt-8 text-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gradient">
            VRK Solutions
          </h1>
          <p className="mt-2 text-muted-foreground text-sm md:text-base">
            First step for your education
          </p>
        </div>

        {/* Loading indicator */}
        <div className="mt-12 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-primary animate-pulse-soft"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
