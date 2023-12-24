import { Schema , model } from "mongoose";

const paymentSchema = new Schema({
       payment_id:{
          type:String,
          required:[true,"PaymentId is required"],
       },
       subscription_id:{
            type:String,
            required:[true,"SubscriptionId is required"],
       },
       signature:{
           type:String,
           required:[true,"Signature is required"]
       }

},
{timestamps:true}
);

const Payment = model('Payment',paymentSchema);

export default Payment;