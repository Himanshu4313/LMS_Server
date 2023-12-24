
import Payment from "../models/payment.schema.js";
import userModel from "../models/user.schema.js";
import { razorpay } from "../server.js";
import crypto from 'crypto';

// controller for razorpay api key
export const razorpayApiKey = async (req , res) =>{
    try {
        
        const { id } = req.user;
      
         // first we check user exists or not 
         const user = await userModel.findById(id);
    
         if(!user){
            return res.status(400).json({success:false , message :"Unauthorized user"});
         }
    
         res.status(200).json({
            success:true,
            message:"Razorpay api key",
            key: process.env.RAZORPAY_API_KEY,
         })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong.Please try again"
        })
    }
}

// controller for subscribe bundle
export const subscribe = async (req , res) =>{
    try {
        
        const { id } = req.user;
   
        const user = await userModel.findById(id);
   
        if(!user){
           return res.status(400).json({
               success:false,
               message:"Unauthorized user.Please loggedIn"
           })
        }
   
        if(user.role === 'ADMIN'){
           return res.status(400).json({
               success:false,
               message:"You can not buy any course because your are the admin and admin can access all of thing."
           })
        }
   
        //these are step to create manually subscription in razorpay 
        const subscription = await razorpay.subscriptions.create({
   
           plan_id:process.env.RAZORPAY_PLAN_ID,
           customer_notify:1
        })
   
        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;
   
        await user.save();
   
        res.status(200).json({
           success:true,
           message:"Subscription successfully",
           subscription_id: subscription.id,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong.Please try again"
        })
    }
}  

// controller for paymentVarify
export const paymentVarify = async (req , res) =>{

    try {
        
        const {razorpay_payment_id , razorpay_subscription_id , razorpay_signature} = req.body;
      
        const { id } = req.user;
        
        const user = await userModel.findById(id);
   
        if(!user){
           return res.status(400).json({
               success:false,
               message:"Unauthorized user.Please loggedIn"
           })
        }
   
        // findout it subscription.id
   
        const subscription_id = user.subscription.id;
   
        // now we create own signature and match with razorpay signature if both signature are same then return payment verifyed other wise not .
   
        const generateSignature =  crypto
        .createHmac('sha256')
        .update(`${razorpay_payment_id}|${subscription_id}`)
        .digest('hex')
    
        if(razorpay_signature !== generateSignature){
           return res.status(500).json({
               success:false,
               message:"Payment not varified.Please try again"
           })
        }
   
        // if payment is done then we save the data in database payment
   
        await Payment.create({
           payment_id:razorpay_payment_id,
           subscription_id:razorpay_subscription_id,
           signature:razorpay_signature
        })
   
         user.subscription.status = 'active';
         await user.save();
   
         res.status(200).json({
             success:true,
             message:"Payment varified successfully."
         })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong. Please try again"
        })
    }
}

//controller for getPayment records
export const getPaymentRecords = async (req , res) =>{

}

// controller for cancel subscription bundle
export const cancelSubscription = async (req , res) =>{

}