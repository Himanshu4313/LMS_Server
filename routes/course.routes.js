import express from 'express';
import { createCourse, getAllCourses, getLecturesByCourseId, removeCourse, updateCourse } from '../controllers/course.controllers.js';
import authJWT from '../middleware/authJWt.js';
import upload from '../middleware/multer.middleware.js';
import authorizedRole from '../middleware/authorizedRoles.middleware.js';

const routes = express.Router();

//routes
// routes.route('/create-course').post(createCourse);

routes.get('/',getAllCourses);

routes.get('/:id',authJWT,getLecturesByCourseId);

routes.post('/',authJWT,authorizedRole, upload.single('thumbnail'),createCourse);

routes.put('/:id' ,authJWT,authorizedRole,updateCourse);

routes.delete('/:id',authJWT,authorizedRole, removeCourse);


export default routes;