// access app file from app.js
import app from './app.js';
import cloudinary from 'cloudinary';
import Razorpay from 'razorpay';
import {config} from 'dotenv';
config();
//This PORT come from .env file
const PORT = process.env.PORT || 3000;

//Cloudinary configration

cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
})

// razorpay payment gateway configration

export const razorpay = new Razorpay({
    key_id:process.env.RAZORPAY_API_KEY,
    key_secret:process.env.RAZORPAY_SECRECT
})
// console.log('Authentication of razorpay',razorpay.subscriptions.create);
//app is listen or server is running 
app.listen(PORT , () =>{
    console.log(`Server is runnig at http://localhost:${PORT}`);
});
