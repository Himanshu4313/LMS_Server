import {Router} from "express";
import { cancelSubscription, getPaymentRecords, paymentVarify, razorpayApiKey, subscribe } from "../controllers/payment.controllers.js";
import authJWT from "../middleware/authJWt.js";
import authorizedRole from "../middleware/authorizedRoles.middleware.js";

const routes = Router();

routes.route('/subscribe').post(authJWT,subscribe);
routes.route('/razorpay-key').get(authJWT,razorpayApiKey) ;
routes.route('/verify').post(authJWT,paymentVarify);   
routes.route('/').get(authJWT,authorizedRole('ADMIN'),getPaymentRecords);
routes.route('/unsubscribe').post(authJWT,cancelSubscription);
export default routes;