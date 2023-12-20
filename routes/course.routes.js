import express from 'express';

const routes = express.Router();

//routes
// routes.route('/create-course').post(createCourse);

routes.post('',createCourse);


export default routes;