import express from 'express';
import { getRegisteration, getUserInfo, loggedIn, logout } from '../controllers/auth.controllers.js';
const authRouter = express.Router();

//Authentication routes
authRouter.post('/register',getRegisteration);
authRouter.post('/login',loggedIn);
authRouter.get('/logout',logout);
authRouter.get('/userinfo',getUserInfo);

export default authRouter;