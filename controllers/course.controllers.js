import Course from "../models/course.schema.js";

// controller for get all courses
export const getAllCourses = async (req , res) =>{
        try {
             const course = await Course.find({}).select('-lectures');
             if(!course){
                return res.status(400).json({
                    success:false,
                    message:"Something went wrong!!"
                })
             }
             //if course are exists than we send all courses to the user
             res.status(200).json({
                success:true,
                message:"Successfully fetch courses",
                course
             })
        } catch (error) {
            return res.status(500).json({
                sucess:false,
                message:"Couldn't fetch the courses",
            })
        }
}

//controller fot get all lecture by course id
export const getLecturesByCourseId = async (req , res) =>{
          const { id }  = req.params;
          try {
               const course = await Course.findById(id);
               if(!course){
                return res.status(400).json({
                    success:false,
                    message:"Failed to fetch your course lectures"
                })
               }
               res.status(200).json({
                  success:true,
                  message:"Successfully get lecture",
                  lectures:course.lectures
               })
          } catch (error) {
            return res.status(500).json({
                success:false,
                message:"Something went wrong,Please try again."
            })
          }
}

//controller for create courses 
export const createCourse = async  (req , res) =>{
     res.json({message:"Course created here"})
}