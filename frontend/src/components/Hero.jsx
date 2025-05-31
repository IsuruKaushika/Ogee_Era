import React from 'react'
import { assets } from '../assets/assets'

const Hero = () => {
  return (
    <div className='flex flex-col sm:flex-row border border-gray-400 overflow-hidden'>
        {/*Hero Right Side - Animated Image*/}
        <div className='w-full sm:w-1/2 order-1 sm:order-none relative overflow-hidden'>
          <img 
            className='w-full h-full object-cover transform transition-all duration-1000 ease-out hover:scale-110 animate-fade-in-right' 
            src={assets.hero_img} 
            alt=""
          />
          <div className='absolute inset-0 bg-gradient-to-r from-transparent to-black/10 opacity-0 hover:opacity-100 transition-opacity duration-500'></div>
        </div>
        
        {/*Hero Left Side - Animated Text*/}
        <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0 animate-fade-in-left'>
          <div className='text-[#414141]'>
              <div className='flex items-center gap-2 animate-slide-in-top' style={{animationDelay: '0.2s'}}>
                  <p className='w-8 md:w-11 h-[2px] bg-[#414141] animate-expand-width'></p>
                  <p className='font-medium text-sm md:text-base opacity-0 animate-fade-in' style={{animationDelay: '0.4s'}}>OUR BESTSELLERS</p>
              </div>
              
              <h1 className='prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed opacity-0 animate-fade-in-up' style={{animationDelay: '0.6s'}}>
                Latest Arrivals
              </h1>
              
              <div className='flex items-center gap-2 animate-slide-in-bottom' style={{animationDelay: '0.8s'}}>
                <p className='font-semibold text-sm md:text-base hover:text-gray-600 transition-colors duration-300 cursor-pointer'>SHOP NOW</p>
                <p className='w-8 md:w-11 h-[1px] bg-[#414141] animate-expand-width' style={{animationDelay: '1s'}}></p>
              </div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes fade-in-right {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
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
          
          .animate-fade-in-right {
            animation: fade-in-right 1s ease-out forwards;
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
          
          @media (max-width: 768px) {
            .animate-expand-width {
              animation: expand-width 0.8s ease-out forwards;
            }
          }
        `}</style>
    </div>
  )
}

export default Hero