import Course from "../models/course.schema.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
// controller for get all courses
export const getAllCourses = async (req , res) =>{
        try {
             const course = await Course.find({}).select('-lectures');
             if(!course){
                return res.status(400).json({
                    success:false,
                    message:"Something went wrong!!.No course are Exists"
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
        const {title , category , createdBy , description } = req.body;
        
        try {

            if(!title || !category || !createdBy || !description){
                return  res.status(400).json({success:false , message :"All fields are mandatory"}) 
            }
           
            const course = await Course.create({
                title,
                category,
                createdBy,
                description,
                thumbnail:{
                    public_id:'Dummy',
                    secure_url:"Dummy",
                }
                    })

        if(!course){
            return res.status(500).json({success:false , message:"Failed to create course."})
        }
           console.log(req.file);
            if(req.file){
                 try {
                     const result = await cloudinary.v2.uploader.upload(req.file.path,{
                        folder:'lms',
                     }) 
                     console.log(result)
                     if(result){
                         course.thumbnail.public_id = result.public_id;
                         course.thumbnail.secure_url = result.secure_url;
                     }
                    fs.rm(`uploads/${req.file.filename}`);
                 } catch (error) {
                    //  throw new Error(error)
                    res.status(500).json({
                        success: false,
                        message: "File not uploaded , Please try again",
                        error,
                      });
                 }
            }

            await course.save();
            res.status(200).json({
                success:true,
                message:"Course created successfully.",
                course
            })
          

            
        } catch (error) {
             console.log(error);
            return res.status(500).json({
                success:false ,
                message:"Something went wrong.Please try again"

            })
        }


}

//controller for updateCourse
export const updateCourse = async (req , res) =>{
    
     const { id } = req.params;

     try {
         
         const course = await Course.findByIdAndUpdate(id , { $set : req.body } , { runValidators : true })
         
         if(!course){
             return res.status(400).json({
                sucess:false,
                message:"Course is does not exists in database with your given CourseID"
             })
         }

         res.status(200).json({
             sucess:true,
             message:"Course Updated successfully",
             course
         })

     } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong.Please try again"
        })
     }


}

//controller for delete course respective with id 

export const removeCourse = async (req , res) =>{
      const { id } = req.params;

      try {

           const course = await Course.findByIdAndDelete(id);

           if(!course){
             return res.status(400).json({
                 sucess:false,
                 message:"Failed to delete Your course."
             })
           }
           res.status(200).json({
                 sucess:true,
                 message:"Course Deleted Successfully"
           })
        
      } catch (error) {
         console.log(error);
         return res.status(500).json({
             success:false,
             message:"Something went wrong.Please try again"
         })
      }
}