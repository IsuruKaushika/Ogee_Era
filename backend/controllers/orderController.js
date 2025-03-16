//placing orders using COD

import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";


const placeOrder=async(req,res)=>{

    try{
        const{userId,items,amount,address}=req.body;

        const orderData={
            userId,
            items,
            address,
            amount,
            paymentMethod:"COD",
            payment:false,
            date:Date.now()

        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId,{cartData:{}})

        res.json({success:true,message:"Order Placed Successfully"})
       

    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})

    }

}

//placing orders using card

const placeOrderWithCard=async(req,res)=>{

}

//All Orders Data from Admin Panel

const allOrders=async(req,res)=>{
    try{
        const orders=await orderModel.find({})
        res.json({success:true,orders})

    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})

    }

}

//user ordered data for fronted

const userOrders=async(req,res)=>{

    try{
        const {userId} = req.body;
        const orders=await orderModel.find({userId})
        res.json({success:true,orders})

    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})


    }


}

//update order status from admin
const updateStatus=async(req,res)=>{
    try{
        const {orderId,status}=req.body;
        await orderModel.findByIdAndUpdate(orderId,{status})
        res.json({success:true,message:"Order Status Updated Successfully"})

    }catch{
        console.log(error)
        res.json({success:false,message:error.message})

    }

}

export {placeOrder,userOrders,updateStatus,allOrders,placeOrderWithCard}