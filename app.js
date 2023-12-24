//enable dotenv file for provide sensative data
import {config} from "dotenv";
config();
//import express to used it functionalities
import express from "express";
//import cors
import cors from "cors";
//import database connection file
import connectToDB from "./configs/connect.database.js";
import authRouter from "./routes/auth.routes.js";
import courseRouter from './routes/course.routes.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import ContactUsRoutes from "./routes/contactUs.routes.js";
import paymentsRoutes from './routes/payments.routes.js';
//create instance of express
const app = express();

//connect database
connectToDB();
// Third party middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin:[process.env.FRONTEND_CLIENT_URL],
    credentials:true
}));

app.use(cookieParser())
app.use(morgan('dev'))

// All routes here 
app.use('/api/v1/user',authRouter); // for auth route

app.use('/api/v1/courses',courseRouter); //for course route


app.use('/api/v1/contact',ContactUsRoutes);// for contact us 

app.use('/api/v1/payments',paymentsRoutes);//for payment related routes
 
app.get('/',(req , res)=>{
       res.status(200).json({Message:"Welcome to LMS backend"});
})

//This route for unknown url request to server 
app.use('*', (req , res) =>{
         res.status(400).send('OOPS! 404 page not found');
})
//export app
export default app;
