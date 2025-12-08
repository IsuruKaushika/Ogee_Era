import React,{useContext,useEffect,useState} from 'react'

import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';

import { useLocation } from'react-router-dom';

const SearchBar = () =>{

  const{search,setSearch,setShowSearch} = useContext(ShopContext);
  const [visible,setVisible] = useState(false)
  const location = useLocation();

  useEffect(()=>{
   if(location.pathname.includes('collection')){
      setVisible(true);
   }
   else{
      setVisible(false);
   }
  }),[location]

  return visible?(
    <div className='text-center'>
      <div className ='inline-flex items-center justify-center border border-gray-400 px-5 py-2 mt-12 rounded-full w-full sm:w-2/3 lg:w-1/2 h-12'>
      <input value ={search} onChange={(e)=>setSearch(e.target.value)} className='flex-1 outline-none bg-inherit text-sm' type="text" placeholder='Search for Products...'/>
      <img src={assets.search_icon} alt='search' className='w-4'/>
      </div>
    </div>
  ):null
}

export default SearchBar