import React from 'react'
import {Routes,Route} from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Collection from './pages/Collection'
import Contact from './pages/Contact'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import Product from './pages/Product'
import Cart from './pages/Cart'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Login from './pages/Login'
import About from './pages/About'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailed from './pages/PaymentFail'
import WhatsAppFloat from './components/WhatsappFloat'
import Terms from './pages/Terms'
import privacy from './pages/Policy'
import Returns from './pages/Returns'

import {ToastContainer,toast} from 'react-toastify'//used for notifications
import 'react-toastify/dist/ReactToastify.css'
import Policy from './pages/Policy'




const App = () => {
  return (
    < div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer/>
      <Navbar />
      <SearchBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/collection' element={<Collection/>} />
        <Route path='/contact' element={<Contact/>} />
        <Route path='/about' element={<About />} />
        <Route path='/product/:productId' element={<Product/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/place-order' element={<PlaceOrder/>} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/orders' element={<Orders/>} />
        <Route path='/payment-success' element={<PaymentSuccess/>} />
        <Route path='/payment-failed' element={<PaymentFailed/>} />
        <Route path='/terms-and-conditions' element={<Terms/>} />
        <Route path='/privacy-and-policy' element={<Policy/>} />
        <Route path='/return-policy' element={<Returns/>} />
                
      </Routes>
      <WhatsAppFloat />

       <Footer/>
    
    
    
   </div>
  )
}

export default App