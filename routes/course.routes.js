import express from 'express';
import { createCourse, getAllCourses, getLecturesByCourseId } from '../controllers/course.controllers.js';
import authJWT from '../middleware/authJWt.js';

const routes = express.Router();

//routes
// routes.route('/create-course').post(createCourse);

routes.get('/',getAllCourses);

routes.get('/:id',authJWT,getLecturesByCourseId);

routes.post('/createCourse',createCourse);


export default routes;