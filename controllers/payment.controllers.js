import Payment from "../models/payment.schema.js";
import userModel from "../models/user.schema.js";
import { razorpay } from "../server.js";
import crypto from "crypto";

// controller for razorpay api key
export const razorpayApiKey = async (req, res) => {
  try {
    const { id } = req.user;

    // first we check user exists or not
    const user = await userModel.findById(id);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Unauthorized user" });
    }

    res.status(200).json({
      success: true,
      message: "Razorpay api key",
      key: process.env.RAZORPAY_API_KEY,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.Please try again",
    });
  }
};

// controller for subscribe bundle
export const subscribe = async (req, res) => {
  try {
    const { id } = req.user;

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized user.Please loggedIn",
      });
    }

    if (user.role === "ADMIN") {
      return res.status(400).json({
        success: false,
        message:
          "You can not buy any course because your are the admin and admin can access all of thing.",
      });
    }

    console.log('Before razorpay api call');
   
      //these are step to create manually subscription in razorpay
     let subscription = await razorpay.subscriptions.create({
        plan_id: process.env.RAZORPAY_PLAN_ID,
        customer_notify: 1,
        total_count:5
     });
      
     console.log('After razorpay api call');
      console.log("subscribeId", subscription);
       
      user.subscription.id = subscription.id;
      user.subscription.status = subscription.status;
    

    await user.save();

    res.status(200).json({
      success: true,
      message: "Subscription successfully",
      subscription_id: subscription.id,
    });
  } catch (error) {
    console.log("Internal server error", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.Please try again",
    });
  }
};

// controller for paymentVarify
export const paymentVarify = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body;

    const { id } = req.user;

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized user.Please loggedIn",
      });
    }

    // findout it subscription.id

    const subscription_id = user.subscription.id;

    // now we create own signature and match with razorpay signature if both signature are same then return payment verifyed other wise not .

    const generateSignature = crypto
      .createHmac("sha256")
      .update(`${razorpay_payment_id}|${subscription_id}`)
      .digest("hex");

    if (razorpay_signature !== generateSignature) {
      return res.status(500).json({
        success: false,
        message: "Payment not varified.Please try again",
      });
    }

    // if payment is done then we save the data in database payment

    await Payment.create({
      payment_id: razorpay_payment_id,
      subscription_id: razorpay_subscription_id,
      signature: razorpay_signature,
    });

    user.subscription.status = "active";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Payment varified successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again",
    });
  }
};


// controller for cancel subscription bundle
export const cancelSubscription = async (req, res) => {
    const { id } = req.user;

  // Finding the user
  const user = await userModel.findById(id);

  // Checking the user role
  if (user.role === 'ADMIN') {
    return res.status(400).json({
        success:false,
        message:'Admin does not need to cannot cancel subscription',
    })
}

  // Finding subscription ID from subscription
  const subscriptionId = user.subscription.id;

  // Creating a subscription using razorpay that we imported from the server
  try {
    const subscription = await razorpay.subscriptions.cancel(
      subscriptionId // subscription id
    );

    // Adding the subscription status to the user account
    user.subscription.status = subscription.status;

    // Saving the user object
    await user.save();
  } catch (error) {
    // Returning error if any, and this error is from razorpay so we have statusCode and message built in
    return res.status(500).json({
        success:false,
        message:"Failed to cancel subscription"
    })
  }

  // Finding the payment using the subscription ID
  const payment = await Payment.findOne({subscription_id:subscriptionId});

  // Getting the time from the date of successful payment (in milliseconds)
  const timeSinceSubscribed = Date.now() - payment.createdAt;

  // refund period which in our case is 14 days
  const refundPeriod = 14 * 24 * 60 * 60 * 1000; //14days

  // Check if refund period has expired or not
  if (refundPeriod <= timeSinceSubscribed) {
    return res.status(400).json({
        success:false,
        message:'Refund period is over, so there will not be any refunds provided.',
    })
  }

  // If refund period is valid then refund the full amount that the user has paid
  await razorpay.payments.refund(payment.payment_id, {
    speed: 'optimum', // This is required
  });

  user.subscription.id = undefined; // Remove the subscription ID from user DB
  user.subscription.status = undefined; // Change the subscription Status in user DB

  await user.save();
  await payment.remove();

  // Send the response
  res.status(200).json({
    success: true,
    message: 'Subscription canceled successfully',
  });

};

//controller for getPayment records
export const getPaymentRecords = async (req, res) => {
    const { count, skip } = req.query;

    // Find all subscriptions from razorpay
    const allPayments = await razorpay.subscriptions.all({
      count: count ? count : 10, // If count is sent then use that else default to 10
      skip: skip ? skip : 0, // // If skip is sent then use that else default to 0
    });
  
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
  
    const finalMonths = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0,
    };
  
    const monthlyWisePayments = allPayments.items.map((payment) => {
      // We are using payment.start_at which is in unix time, so we are converting it to Human readable format using Date()
      const monthsInNumbers = new Date(payment.start_at * 1000);
  
      return monthNames[monthsInNumbers.getMonth()];
    });
  
    monthlyWisePayments.map((month) => {
      Object.keys(finalMonths).forEach((objMonth) => {
        if (month === objMonth) {
          finalMonths[month] += 1;
        }
      });
    });
  
    const monthlySalesRecord = [];
  
    Object.keys(finalMonths).forEach((monthName) => {
      monthlySalesRecord.push(finalMonths[monthName]);
    });
  
    res.status(200).json({
      success: true,
      message: 'All payments',
      allPayments,
      finalMonths,
      monthlySalesRecord,
    });
}