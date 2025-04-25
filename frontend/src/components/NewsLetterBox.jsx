import React, { useState } from 'react'
import emailjs from '@emailjs/browser'

const NewsLetterBox = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const onSubmitHandler = (event) => {
    event.preventDefault()

    const templateParams = {
      email: email, // Must match variable name in your EmailJS template
    }

    console.log("Sending email with params:", templateParams)

    emailjs.send(
      'service_rnsr2tp',       // Your EmailJS service ID
      'template_06lsvyx',      // Your EmailJS template ID
      templateParams,
      'r_QvKdxh2QjipiCmk'      // Your EmailJS public key
    )
    .then((response) => {
      console.log('SUCCESS!', response.status, response.text)
      setStatus('🎉 Subscribed successfully!')
      setEmail('')
      setError('')
    })
    .catch((error) => {
      console.error('FAILED...', error)
      setStatus('')
      setError('❌ Failed to subscribe. Please try again.')
    })
  }

  return (
    <div className='text-center'>
      <p className='text-2xl font-medium text-gray-800'>Subscribe Now to Our Newsletter</p>
      <p className='text-gray-400 mt-3'>
        Get E-mail updates about our latest shop and special offers.
      </p>
      <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3'>
        <input
          className='w-full sm:flex-1 outline-none'
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Enter Your Email'
          required
        />
        <button type='submit' className='bg-black text-white text-xs px-10 py-4'>SUBSCRIBE</button>
      </form>

      {status && <p className='text-sm text-green-600 mt-2'>{status}</p>}
      {error && <p className='text-sm text-red-600 mt-2'>{error}</p>}
    </div>
  )
}

export default NewsLetterBox
