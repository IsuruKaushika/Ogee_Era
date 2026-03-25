import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { HeroImages } from "../assets/assets";

const Hero = () => {
  const { navigate } = useContext(ShopContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    if (HeroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % HeroImages.length,
        );
      }, 4000);

      return () => clearInterval(interval);
    }
  }, []);

  // Manual navigation functions
  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HeroImages.length);
  };

  const goToPrev = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? HeroImages.length - 1 : prevIndex - 1,
    );
  };

  const goToSlide = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="flex flex-col sm:flex-row border border-gray-400 overflow-hidden min-h-[540px] md:min-h-[500px] lg:h-[calc(100vh-96px)]">
      {/*Hero Right Side - Rotating Bestseller Images*/}
      <div className="w-full sm:w-1/2 relative overflow-hidden group">
        <div className="relative h-[540px] sm:h-[600px] lg:h-full">
          {/* {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse z-50" />
          )} */}
          {HeroImages.map((imageData, index) => (
            <img
              key={imageData.id}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out transform ${index === 0 ? "animate-fade-in" : ""} ${
                index === currentImageIndex
                  ? "opacity-100 scale-100 "
                  : "opacity-0 scale-105"
              }`}
              src={imageData.src}
              alt={imageData.name}
              loading="eager"
              fetchpriority="high"
            />
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 opacity-0 transition-opacity duration-300 z-10 group-hover:opacity-100 hover:bg-white sm:block"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 opacity-0 transition-opacity duration-300 z-10 group-hover:opacity-100 hover:bg-white sm:block"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
            {HeroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-56 bg-gradient-to-t from-black/75 via-black/30 to-transparent sm:hidden"></div>

          <div className="absolute inset-x-4 bottom-8 z-20 sm:hidden">
            <div className="px-1 text-white">
              <div
                className="flex items-center gap-2 animate-slide-in-top"
                style={{ animationDelay: "0.2s" }}
              >
                <p className="h-[2px] w-8 bg-white/80 animate-expand-width"></p>
                <p
                  className="text-xs font-medium opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.4s" }}
                >
                  OUR BESTSELLERS
                </p>
              </div>

              <h1
                className="prata-regular py-2 text-[30px] leading-[1.1] opacity-0 animate-fade-in-up"
                style={{ animationDelay: "0.6s" }}
              >
                Featured Products
              </h1>

              <div
                className="flex w-full items-center gap-2 animate-slide-in-bottom"
                style={{ animationDelay: "0.8s" }}
              >
                <p
                  className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300"
                  onClick={() => navigate("/collection")}
                >
                  SHOP NOW
                </p>
                <p
                  className="h-px w-8 bg-white/80 animate-expand-width"
                  style={{ animationDelay: "1s" }}
                ></p>
              </div>

              <div
                className="mt-3 max-w-[14rem] opacity-0 animate-fade-in"
                style={{ animationDelay: "1.2s" }}
              >
                <p className="text-xs text-white/80 hidden sm:block">
                  Now Featuring:
                </p>
                <p className="text-sm leading-5 text-white">
                  {HeroImages[currentImageIndex]?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Image Info Overlay */}
          <div className="absolute bottom-16 left-4 hidden bg-black/50 px-3 py-2 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block">
            <p className="text-sm font-medium">
              {HeroImages[currentImageIndex]?.name}
            </p>
          </div>
        </div>
      </div>

      {/*Hero Left Side - Animated Text*/}
      <div className="hidden w-full sm:flex sm:w-1/2 items-center justify-start py-10 sm:py-0 sm:pl-8 lg:pl-14 xl:pl-20 animate-fade-in-left">
        <div className="text-[#414141] max-w-[32rem]">
          <div
            className="flex items-center gap-2 animate-slide-in-top"
            style={{ animationDelay: "0.2s" }}
          >
            <p className="w-8 md:w-11 h-[2px] bg-[#414141] animate-expand-width"></p>
            <p
              className="font-medium text-sm md:text-base opacity-0 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              OUR BESTSELLERS
            </p>
          </div>

          <h1
            className="prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            Featured Products
          </h1>

          <div
            className="flex items-center gap-2 animate-slide-in-bottom"
            style={{ animationDelay: "0.8s" }}
          >
            <p
              className="font-semibold text-sm md:text-base hover:text-gray-600 transition-colors duration-300 cursor-pointer"
              onClick={() => navigate("/collection")}
            >
              SHOP NOW
            </p>
            <p
              className="w-8 md:w-11 h-[1px] bg-[#414141] animate-expand-width"
              style={{ animationDelay: "1s" }}
            ></p>
          </div>

          {/* Current Product Name */}
          <div
            className="mt-4 opacity-0 animate-fade-in"
            style={{ animationDelay: "1.2s" }}
          >
            <p className="text-sm text-gray-500">Now Featuring:</p>
            <p className="font-medium text-lg">
              {HeroImages[currentImageIndex]?.name}
            </p>
          </div>
        </div>
      </div>

      <style>{`
          @keyframes fade-in-left {
            from {
              opacity: 0;
              transform: translateX(-50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slide-in-top {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slide-in-bottom {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes expand-width {
            from {
              width: 0;
            }
            to {
              width: 2rem;
            }
          }
          
          .animate-fade-in-left {
            animation: fade-in-left 1s ease-out forwards;
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
          }
          
          .animate-slide-in-top {
            animation: slide-in-top 0.6s ease-out forwards;
          }
          
          .animate-slide-in-bottom {
            animation: slide-in-bottom 0.6s ease-out forwards;
          }
          
          .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
          }
          
          .animate-expand-width {
            animation: expand-width 0.8s ease-out forwards;
          }
        `}</style>
    </div>
  );
};

export default Hero;
