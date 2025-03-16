import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsLetterBox from '../components/NewsLetterBox'

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'} />
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className ='w-full md:max-w-[450px]' src={assets.about_img} alt="About Us"/>
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <h2 className='text-xl font-semibold text-gray-800'>Who We Are</h2>
          <p>We bring you the latest fashion trends with high-quality, stylish, and affordable clothing. Whether you're looking for everyday essentials or statement pieces, we have something for everyone.</p>
          
          <h2 className='text-xl font-semibold text-gray-800'>Our Mission</h2>
          <p>Our mission is to make shopping easy, enjoyable, and accessible from anywhere. We strive to provide the best quality products at affordable prices, ensuring customer satisfaction with every purchase.</p>
          
          <h2 className='text-xl font-semibold text-gray-800'>Our Vision</h2>
          <p>We envision a world where fashion is inclusive, sustainable, and empowers individuals to express their unique style with confidence. Our goal is to become a globally recognized brand known for quality, affordability, and innovation.</p>
        </div>
      </div>
      <div className ='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className ='flex flex-col md:flex-row text-sm mb-20'>
        <div className ='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quality Assurance :</b>
          <p className='text-gray-600'>We prioritize quality in every piece of clothing we offer. From fabric selection to stitching, we ensure that our products meet the highest standards of durability and comfort. Our commitment to quality allows our customers to enjoy long-lasting fashion that looks and feels great.</p>
        </div>
        <div className ='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Convenience :</b>
          <p className='text-gray-600'>Shopping with us is hassle-free and enjoyable. Our user-friendly website and seamless checkout process make it easy to find your perfect outfit. With fast shipping and multiple payment options, we ensure a smooth and convenient shopping experience from start to finish.</p>
        </div>
        <div className ='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Exceptional Customer Service :</b>
          <p className='text-gray-600'>Customer satisfaction is our top priority. Our dedicated support team is always ready to assist you with any queries or concerns. Whether it's sizing help, order tracking, or returns, we are committed to providing a friendly and responsive service that enhances your shopping experience.</p>
        </div>
      </div>
      <NewsLetterBox/>
    </div>
  )
}

export default About
