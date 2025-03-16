import React, { useContext, useState } from "react";

import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";




const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const {navigate,backendUrl,token,cartItems,setCartItems,getCartAmount,delivery_fee,products} = useContext(ShopContext);

  const [formData,setFormData]=useState({
    firstName:'',
    lastName:'',
    email:'',
    street:'',
    city:'',
    state:'',
    zipcode:'',
    country:'',
    phone:''
    ,})

    const onChangeHandler =(event)=>{
      const name=event.target.name;
      const value=event.target.value;

      setFormData(data=>({...data,[name]:value}))
    }

  const onSubmitHandler =async(event)=>{
    event.preventDefault();
    try{
      let orderItems =[]

      for(const items in cartItems){
        for(const item in cartItems[items]){
          if(cartItems[items][item]>0){
            const itemInfo = structuredClone(products.find(product=>product._id===items))
            if(itemInfo){
              itemInfo.size=item
              itemInfo.quantity=cartItems[items][item]
              orderItems.push(itemInfo)
            }
          }
      }
    }
      let orderData={
        address:formData,
        items:orderItems,
        amount:getCartAmount()+delivery_fee
      }
      switch(method){
        //API calls COD
        case 'cod':
          const response =await axios.post(backendUrl+'/api/order/place',orderData,{headers:{token}})
          
          if(response.data.success){
            toast.success(response.data.message)
            setCartItems({})
            navigate('/orders')
          }else{
            toast.error(response.data.message)
          }
          break;

        

        default:
          break;

      }
  }catch(error){
    console.log(error)
  }
}
  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] px-4">
      {/* ---------- Left Side (Delivery Information) ---------- */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required onChange={onChangeHandler} name='firstName'value={formData.firstName} className="border p-2 rounded w-full" type="text" placeholder="First name" />
          <input  required onChange={onChangeHandler} name='lastName'value={formData.lastName}className="border p-2 rounded w-full" type="text" placeholder="Last name" />
        </div>
        <input required onChange={onChangeHandler} name='email'value={formData.email}className="border p-2 rounded w-full" type="email" placeholder="Email address" />
        <input required onChange={onChangeHandler} name='street'value={formData.street} className="border p-2 rounded w-full" type="text" placeholder="Street" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required onChange={onChangeHandler} name='city'value={formData.city} className="border p-2 rounded w-full" type="text" placeholder="City" />
          <input required onChange={onChangeHandler} name='state'value={formData.state}className="border p-2 rounded w-full" type="text" placeholder="State" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required onChange={onChangeHandler} name='zipcode'value={formData.zipcode}className="border p-2 rounded w-full" type="text" placeholder="Zipcode" />
          <input required onChange={onChangeHandler} name='country'value={formData.country} className="border p-2 rounded w-full" type="text" placeholder="Country" />
        </div>

        <input required onChange={onChangeHandler} name='phone'value={formData.phone}className="border p-2 rounded w-full" type="tel" placeholder="Phone" />
      </div>

      {/* ---------- Right Side (Cart Totals) ---------- */}

      <div className="mt-8 w-full sm:max-w-[480px]">
        <div className="mt-8">
          <CartTotal />
        </div>

        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          {/*----Payment Method----*/}
          <div className="flex gap-3 flex-col lg:flex-row">
            {/* Stripe Payment */}
            <div
              onClick={() => setMethod("stripe")}
              className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${
                method === "stripe" ? "border-green-500" : "border-gray-300"
              }`}
            >
              <p
                className={`w-3.5 h-3.5 border rounded-full ${
                  method === "stripe" ? "bg-green-400" : "bg-gray-300"
                }`}
              ></p>
              <img className="h-5 mx-4" src={assets.stripe_logo} alt="Stripe" />
            </div>

            {/* Cash on Delivery (COD) */}
            <div
              onClick={() => setMethod("cod")}
              className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${
                method === "cod" ? "border-green-500" : "border-gray-300"
              }`}
            >
              <p
                className={`w-3.5 h-3.5 border rounded-full ${
                  method === "cod" ? "bg-green-400" : "bg-gray-300"
                }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">CASH ON DELIVERY</p>
            </div>
          </div>
        </div>

        {/* ---- Place Order Button ---- */}
        <button type='submit'  className="w-full mt-6 bg-black text-white py-3 rounded-md text-lg font-medium hover:bg-gray-800 transition">
          Place Order
        </button>
      </div>
    </form>
  );
};

export default PlaceOrder;
