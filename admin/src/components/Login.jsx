import React from 'react'
import axios from 'axios'
import {backendUrl} from '../App'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Login = ({setToken}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const response = await axios.post(backendUrl + '/api/user/admin', { email, password })
      if (response.data.success) {
        setToken(response.data.token)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to Login')
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center w-full px-4'>
      <div className='bg-white border border-slate-200 shadow-sm rounded-2xl px-6 sm:px-8 py-8 w-full max-w-md'>
        <img src={assets.logo} alt='OgeeEra' className='h-12 w-auto mx-auto mb-4' />
        <h1 className='text-xl font-semibold text-slate-800 text-center'>Admin Panel</h1>
        <p className='text-sm text-slate-500 text-center mb-6'>Sign in to manage your store</p>
        <form onSubmit={onSubmitHandler}>
          <div className='mb-4'>
            <p className='text-sm font-medium text-slate-700 mb-1.5'>Email Address</p>
            <input onChange={(e)=>setEmail(e.target.value)} value={email} className='w-full px-3 py-2.5' type="email" placeholder='your@email.com' autoComplete='username' required/>
          </div>
          <div className='mb-4'>
            <p className='text-sm font-medium text-slate-700 mb-1.5'>Password</p>
            <input onChange={(e)=>setPassword(e.target.value)} value={password} className='w-full px-3 py-2.5' type="password" placeholder='Enter your password' autoComplete='current-password' required/>
          </div>
          <button disabled={busy} className='mt-2 w-full py-2.5 px-4 rounded-lg text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-60 transition-colors font-medium' type="submit">
            {busy ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
