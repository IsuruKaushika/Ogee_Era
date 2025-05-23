import React from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import {Routes,Route} from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer} from 'react-toastify'

import Add from './pages/Add'
import List from './pages/List'
import PlacedOrders from './pages/PlacedOrders'
import PackingOrders from './pages/PackingOrders'
import DeliveredOrders from './pages/DeliveredOrders'
import Edit from './pages/Edit';

import Login from './components/Login'
import { useState } from 'react'
import { useEffect } from 'react';

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency ='Rs'



const App = () => {

  const[token,setToken] =useState(localStorage.getItem('token')?localStorage.getItem('token'):'');

  useEffect(() => {
    localStorage.setItem('token', token);
  }, [token]);

  return (
    <div className ='bg-gray-50 min-h-screen'>
      <ToastContainer/>
      {token===""
      ? <Login setToken={setToken}/>
      : <>
      <Navbar setToken={setToken}/>
      <hr />
      <div className ='flex w-full'>
        <Sidebar />
        <div className ='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
  
          <Routes>
            <Route path ="/add" element={<Add token={token}/>} />
            <Route path ="/list" element={<List token={token}/>} />
            <Route path ="/Placedorders" element={<PlacedOrders token={token}/>} />
            <Route path ="/PackingOrders" element={<PackingOrders token={token}/>} />
            <Route path ="/DeliveredOrders" element={<DeliveredOrders token={token}/>} />
            <Route path ="/edit/:id" element={<Edit token={token}/>} />
            <Route path="/" element={<Add token={token}/>} />

          
  
          </Routes>
        </div>
        </div>
        </>
      }
   
    </div>
   
    
  )
}

export default App