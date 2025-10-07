import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-30 text-sm'>
            <div>
                <img src={assets.logo} className='mb-5 w-32' alt="Ogiera Logo"/>
                <p className='w-full md:w-2/3 text-gray-600'>
                Hurry, Shop Now and Embrace the Essence of Ogee's Unique Style!
                </p>
            </div>
            <div>
                <p className='text-xl font-medium mb-5'>COMPANY</p>
                <ul className='flex flex-col gap-1 text-gray-600'>
                    <li><a href="/" className="hover:text-gray-900 transition-colors">Home</a></li>
                    <li><a href="/about" className="hover:text-gray-900 transition-colors">About Us</a></li>
                    <li><a href="/terms-and-conditions" className="hover:text-gray-900 transition-colors">Terms and Conditions</a></li>
                    <li><a href="/privacy-and-policy" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
                    <li><a href="/return-policy" className="hover:text-gray-900 transition-colors">Return Policy</a></li>
                   
                    
                    <li><a href="/contact" className="hover:text-gray-900 transition-colors">Contact Us</a></li>
                </ul>
            </div>
            <div>
                <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            
                
                <div className="flex gap-4 mt-6">
                    {/* Facebook Icon */}
                    <a href="https://www.facebook.com/share/1BZtCgfBgd/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-600 hover:text-blue-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                    </a>
                    {/* Instagram Icon */}
                    <a href="https://www.instagram.com/ogee_era?igsh=MTI0aG94cG5rMGQxMA==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-600 hover:text-pink-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                    {/* TikTok Icon */}
                    <a href="https://www.tiktok.com/@0gee_era?_t=ZS-8vqiO4zOGkK&_r=1" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-gray-600 hover:text-black transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
                            <path d="M15 8h.01"></path>
                            <path d="M15 2h-2a4 4 0 0 0-4 4v12"></path>
                            <path d="M19 8a4 4 0 0 0-4-4"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
<div>
            <hr />
            <div className='flex justify-between items-center py-5'>
                <p className='text-sm text-center flex-1'>Copyright 2024@ OgeeEra.lk - All Rights Reserved.</p>
                <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-600'>Powered by</span>
                    <a href="https://yourcompanywebsite.com" target="_blank" rel="noopener noreferrer">
                        <img src={assets.company} alt="Company Logo" className='h-6 w-auto hover:opacity-80 transition-opacity cursor-pointer' />
                    </a>
                </div>
            </div>
        </div>
        <div>
            <hr />
            
        </div>
    </div>
  )
}

export default Footer