// import mongoose 
import mongoose from "mongoose";
import {config} from 'dotenv';
config();
const MONGODB = process.env.MONGODB_URI || 'mongodb://localhost:27017/LMS';
//create a function 
const connectToDB = async () =>{
     mongoose.connect(MONGODB)
     .then((conn) =>{
        console.log(`Database connect successfully at ${conn.connection.host}`);
     })
     .catch((e) =>{
        console.log(e);
        process.exit(1);
     })
}
export default connectToDB;