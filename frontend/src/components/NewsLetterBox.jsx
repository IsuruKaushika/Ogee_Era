import axios from 'axios';
import React, { useState } from 'react';

const NewsLetterBox = () => {
  const [name, setName] = useState('OgeeEra');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [buttonText, setButtonText] = useState("Subscribe");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonText("Subscribing...");

    const serviceId = 'service_rnsr2tp'; // Your EmailJS service ID
    const templateId = 'template_06lsvyx'; // Your template ID
    const publicKey = 'r_QvKdxh2QjipiCmk'; // Your EmailJS public key

    const data = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        title: "Newsletter Subscription",
        name: name,  
        message: "New subscriber to the newsletter!",
        email: email
      }
    };

    try {
      const res = await axios.post("https://api.emailjs.com/api/v1.0/email/send", data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(res.data);
      setEmail('');
      setButtonText("Subscribe");
      alert("Subscription successful! Check your inbox.");
    } catch (error) {
      console.error("Email send error:", error.response ? error.response.data : error.message);
      setButtonText("Subscribe");
      alert(`Error subscribing: ${error.response ? error.response.data.error : error.message}`);
    }
  };

  return (
    <div className='text-center'>
      <p className='text-2xl font-medium text-gray-800'>Subscribe Now to Our Newsletter</p>
      <p className='text-gray-400 mt-3'>
        Get E-mail updates about our latest shop and special offers.
      </p>
      <form className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3' onSubmit={handleSubmit}>
        <input 
          className='w-full sm:flex-1 outline-none' 
          type="email" 
          placeholder='Enter Your Email' 
          required 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type='submit' className='bg-black text-white text-xs px-10 py-4'>
          {buttonText}
        </button>
      </form>
    </div>
  );
}

export default NewsLetterBox;
