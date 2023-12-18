import express from 'express';
import { forgotPassword, getRegisteration, getUserInfo, loggedIn, logout, resetPassword } from '../controllers/auth.controllers.js';
import authJWT from '../middleware/authJWt.js';
import upload from '../middleware/multer.middleware.js';
import { changePassword } from '../controllers/auth.controllers.js';
import { updateProfile } from '../controllers/auth.controllers.js';
const authRouter = express.Router();

//Authentication routes
authRouter.post('/register',upload.single('avatar'), getRegisteration);
authRouter.post('/login',loggedIn);
authRouter.get('/logout',authJWT,logout);
authRouter.get('/me',authJWT,getUserInfo);
authRouter.post('/forgot-password',forgotPassword);
authRouter.post('/reset-password/:resetToken',resetPassword);
authRouter.post('/change-password',authJWT,changePassword);
authRouter.put('/update',authJWT,upload.single('avatar'),updateProfile)

export default authRouter;