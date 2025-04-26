import React, { useState, useRef } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsLetterBox from '../components/NewsLetterBox'
import emailjs from '@emailjs/browser'

const Contact = () => {
  const form = useRef();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // EmailJS service configuration
    emailjs.sendForm(
      'service_rnsr2tp', // Replace with your EmailJS service ID
      'template_2hw59xa', // Replace with your EmailJS template ID
      form.current,
      'r_QvKdxh2QjipiCmk' // Replace with your EmailJS public key
    )
    .then((result) => {
      console.log('Email sent successfully:', result.text);
      setLoading(false);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, (error) => {
      console.error('Failed to send email:', error.text);
      setLoading(false);
      setStatus('error');
    });
  };

  return (
    <div className="bg-gray-50">
      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1={'CONTACT'} text2={'US'} />
        <p className="text-gray-600 max-w-2xl mx-auto mt-4 px-4">
          We'd love to hear from you! Whether you have a question about our products, orders, or anything else, our team is ready to answer all your inquiries.
        </p>
      </div>
      
      {/* Contact Info and Form Section */}
      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 px-4 max-w-6xl mx-auto'>
        {/* Left side - Store info and image */}
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <img className='w-full rounded-lg shadow-md' src={assets.contact_img} alt="Our Store" />
          
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h2 className='font-semibold text-xl text-gray-800 border-b pb-3 mb-4'>Visit Our Store</h2>
            <div className='flex flex-col gap-4'>
              <div className='flex items-start gap-3'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className='text-gray-600'>
                  <span className='font-medium'>Address:</span><br />
                  'Saumya Jayasena'<br />
                  191/2, Ambagahawatta, Kalawana
                </p>
              </div>
              
              <div className='flex items-start gap-3'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <p className='text-gray-600'>
                  <span className='font-medium'>Phone:</span><br />
                  +94 703014670
                </p>
              </div>
              
              <div className='flex items-start gap-3'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className='text-gray-600'>
                  <span className='font-medium'>Email:</span><br />
                  ogeeeraa@gmail.com
                </p>
              </div>
              
              <div className='flex items-start gap-3'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className='text-gray-600'>
                  <span className='font-medium'>Working Hours:</span><br />
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 9:00 AM - 4:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>
          
      
        </div>
        
        {/* Right side - Contact form */}
        <div className="w-full md:w-1/2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className='font-semibold text-xl text-gray-800 border-b pb-3 mb-4'>Send Us a Message</h2>
            <form ref={form} onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors mt-2 flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : 'Send Message'}
              </button>
              
              {status === 'success' && (
                <div className="mt-3 p-3 bg-green-100 text-green-700 rounded-md">
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}
              
              {status === 'error' && (
                <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-md">
                  Failed to send message. Please try again later or contact us directly.
                </div>
              )}
            </form>
            
          </div>
          <div>
              <div className="my-6"></div>
          
          </div>

              {/* Social Media Icons */}
              <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className='font-semibold text-xl text-gray-800 border-b pb-3 mb-4'>Connect With Us</h2>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/share/1BZtCgfBgd/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="bg-gray-100 p-3 rounded-full hover:bg-blue-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="https://www.instagram.com/ogee_era?igsh=MTI0aG94cG5rMGQxMA==" target="_blank" rel="noopener noreferrer" className="bg-gray-100 p-3 rounded-full hover:bg-pink-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@0gee_era?_t=ZS-8vqiO4zOGkK&_r=1" target="_blank" rel="noopener noreferrer" className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                  <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
                  <path d="M15 8h.01"></path>
                  <path d="M15 2h-2a4 4 0 0 0-4 4v12"></path>
                  <path d="M19 8a4 4 0 0 0-4-4"></path>
                </svg>
              </a>
             
            </div>
          </div>
          
       
        </div>
        
      </div>
      
      {/* FAQ Section */}
      <div className="bg-white py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid gap-4">
            {[
              {
                question: "What are your shipping options?",
                answer: "We offer standard shipping (3-5 business days), express shipping (1-2 business days), and international shipping options. Shipping costs vary based on location and selected shipping method."
              },
              {
                question: "How can I track my order?",
                answer: "Once your order is shipped, you will receive a confirmation email with tracking information. You can use this tracking number to monitor your shipment's progress."
              },
              {
                question: "What is your return policy?",
                answer: "We accept returns within 30 days of purchase. Items must be in original condition with tags attached. Please contact our customer service team to initiate a return."
              },
              {
                question: "Do you offer international shipping?",
                answer: "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location."
              }
            ].map((faq, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-lg mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <NewsLetterBox/>
    </div>
  )
}

export default Contact