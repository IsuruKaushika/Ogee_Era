import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'

const Hero = () => {
  const { products } = useContext(ShopContext);
  const [bestSellerImages, setBestSellerImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Get bestseller images
  useEffect(() => {
    if (products && products.length > 0) {
      const bestProducts = products.filter((item) => item.bestseller);
      const images = bestProducts.map(product => ({
        src: Array.isArray(product.image) ? product.image[0] : product.image,
        name: product.name,
        id: product._id
      }));
      setBestSellerImages(images);
      setIsLoading(false);
    }
  }, [products]);

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    if (bestSellerImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % bestSellerImages.length
        );
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [bestSellerImages]);

  // Manual navigation functions
  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % bestSellerImages.length
    );
  };

  const goToPrev = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? bestSellerImages.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentImageIndex(index);
  };

  if (isLoading || bestSellerImages.length === 0) {
    return (
      <div className='flex flex-col sm:flex-row border border-gray-400 h-[500px] sm:h-[600px] lg:h-[700px]'>
        <div className='w-full sm:w-1/2 order-1 sm:order-none bg-gray-200 animate-pulse'></div>
        <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
          <div className='text-[#414141]'>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col sm:flex-row border border-gray-400 overflow-hidden min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]'>
        {/*Hero Right Side - Rotating Bestseller Images*/}
        <div className='w-full sm:w-1/2 order-1 sm:order-none relative overflow-hidden group'>
          <div className='relative h-[500px] sm:h-[600px] lg:h-[700px]'>
            {bestSellerImages.map((imageData, index) => (
              <img 
                key={imageData.id}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out transform ${
                  index === currentImageIndex 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-105'
                }`}
                src={imageData.src} 
                alt={imageData.name}
              />
            ))}
            
            {/* Navigation Arrows */}
            <button 
              onClick={goToPrev}
              className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10'
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              onClick={goToNext}
              className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10'
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots Indicator */}
            <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10'>
              {bestSellerImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentImageIndex 
                      ? 'bg-white' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>

            {/* Image Info Overlay */}
            <div className='absolute bottom-16 left-4 bg-black/50 text-white px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
              <p className='text-sm font-medium'>
                {bestSellerImages[currentImageIndex]?.name}
              </p>
            </div>
          </div>
        </div>
        
        {/*Hero Left Side - Animated Text*/}
        <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0 animate-fade-in-left'>
          <div className='text-[#414141]'>
              <div className='flex items-center gap-2 animate-slide-in-top' style={{animationDelay: '0.2s'}}>
                  <p className='w-8 md:w-11 h-[2px] bg-[#414141] animate-expand-width'></p>
                  <p className='font-medium text-sm md:text-base opacity-0 animate-fade-in' style={{animationDelay: '0.4s'}}>OUR BESTSELLERS</p>
              </div>
              
              <h1 className='prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed opacity-0 animate-fade-in-up' style={{animationDelay: '0.6s'}}>
                Featured Products
              </h1>
              
              <div className='flex items-center gap-2 animate-slide-in-bottom' style={{animationDelay: '0.8s'}}>
                <p className='font-semibold text-sm md:text-base hover:text-gray-600 transition-colors duration-300 cursor-pointer'>SHOP NOW</p>
                <p className='w-8 md:w-11 h-[1px] bg-[#414141] animate-expand-width' style={{animationDelay: '1s'}}></p>
              </div>
              
              {/* Current Product Name */}
              <div className='mt-4 opacity-0 animate-fade-in' style={{animationDelay: '1.2s'}}>
                <p className='text-sm text-gray-500'>Now Featuring:</p>
                <p className='font-medium text-lg'>
                  {bestSellerImages[currentImageIndex]?.name}
                </p>
              </div>
          </div>
        </div>
        
        <style jsx>{`
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
  )
}

export default Hero