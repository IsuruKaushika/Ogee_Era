import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext'
import { useEffect } from 'react'
import ProductItem from '../components/ProductItem'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import RelatedProducts from '../components/RelatedProducts'


const Product = () => {

  const {productId} = useParams();
  const {products,currency,addToCart} = useContext(  ShopContext);
  const[productData,setProductData] = useState(false)
  const [image,setImage] = useState('')
  const [size,setSize] = useState('')

  const fetchProductData = async()=>{

    products.map((item)=>{
      if(item._id === productId){
        setProductData(item)
        setImage(item.image[0])
      
        return null;
       }
    })

  }

  useEffect(()=>{
    fetchProductData();
  },[productId,products])

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/*product details*/}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/*product Imagesls*/}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {
              productData.image.map((item,index)=>(
                <img onClick={()=>setImage(item)} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer  ' src={item} alt=""/>
              ))
            }
       
        </div>
        <div className='w-full sm:w-[80%]'>
          <img className='w-full h-auto' src={image} alt=""/>
        </div>
      </div>
      {/*product details*/}
      <div className='flex-1'>
        <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
        
        <p className='mt-5 text-3xl font-medium'>{currency} {productData.price}</p>
        <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
        <div className ='flex flex-col gap-4 my-8'>
          <p>Select Size</p>
          <div className='flex gap-2'>
            {productData.sizes.map((item,index)=>(
              <button onClick={()=>setSize(item)} className={`border py-2 px-4 bg-gray-100 ${item === size? 'border-orange-500' :''} `} key={index}>{item}</button>
            ))}
          </div>
        </div>
        <button onClick={()=>addToCart(productData._id,size)} className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>ADD TO CART</button>
        <hr className='mt-8 sm:w-4/5'/>
        <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
          <p>100% Original Product.</p>
          <p>Cash On dilivery is available i=on this product.</p>
          <p>Easy return and exchange policy within 7 days.</p>
        </div>
      </div>
    </div>
    {/*Description and review*/}
   
      {/*related products*/}

      <RelatedProducts category={productData.category} subCategory={productData.subCategory}/>
    </div>

    
    
  ) :<div className ='opacity-0'></div>
}

export default Product