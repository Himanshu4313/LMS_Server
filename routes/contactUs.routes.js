import express from 'express';
import { ContactUs } from '../controllers/contactus.controller.js';

const routes = express.Router();

routes.route("/").post(ContactUs);

export default routes;