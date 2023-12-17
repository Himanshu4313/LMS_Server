import express from 'express';
import { getRegisteration, getUserInfo, loggedIn, logout } from '../controllers/auth.controllers.js';
import authJWT from '../middleware/authJWt.js';
const authRouter = express.Router();

//Authentication routes
authRouter.post('/register',getRegisteration);
authRouter.post('/login',loggedIn);
authRouter.get('/logout',authJWT,logout);
authRouter.get('/user',authJWT,getUserInfo);

export default authRouter;