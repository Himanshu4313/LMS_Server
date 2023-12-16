import userModel from "../models/user.schema.js";
import bcrypt from 'bcrypt';
import emailValid from 'email-validator';
//function for user registeration
export const getRegisteration = async (req , res ) =>{
          const {fullName , email , password , } = req.body;

          if(!fullName || !email || !password){
                return res
                .status(400)
                .json({message : "All fields are mandatory"})
          }
          
          if(!emailValid.validate(this.email)){
              return res.status(400).json({success:false,message:"Please enter correct email"})
          }
          try {
               
            const userExists = await userModel.findOne({email});

            if(userExists){
               return res
               .status(400)
               .json({
                  success:false,
                  message:"User can already register"
               })
            }
  
           const newUser =await userModel.create({
                 fullName,
                 email,
                 password
            })

            const token = newUser.generateJWTToken();

            newUser.password = undefined;

            const cookieOption = {
                maxAge : 24 * 60 * 60 * 1000,
                httpOnly:true
            }
            res.cookie("token" , token , cookieOption);
            res.status(200).json({
                success:true,
                message:"User register sucessfully",
                data: newUser
            })
  
          } catch (error) {
               return res
               .status(500)
               .json({
                   success:false,
                   message:"Failed to register"
               })
          }
         
}
//function for user login
export const loggedIn = async (req , res ) =>{
           const {email , password} = req.body;

           if(!email || !password){
              return res.status(400).json({
                   success:false,
                   message:"All fields are required"
              })
           }
           if(!emailValid.validate(this.email)){
               return  res.status(400).json({
                success:false,
                message:"Please enter correct email address",
           })
           }
            try {
                
                const userExists = await userModel.findOne({email}).select('+password');
     
                if(!userExists || !userExists.password){
                    return res.status(400).json({success:false , message:"User does not exists"});
                }
     
                //if user can exists
                if(!userExists || !(await bcrypt.compare(password,userExists.password))){
                   return res.status(400).json({success:false , message:"Incorrect password"})
                }
     
                //if all condition are true then
                
                const token = userExists.generateJWTToken();
     
                userExists.password = undefined;
     
                const cookieOption = {
                    maxAge : 24 * 60 * 60 * 1000,
                    httpOnly:true
                }
                res.cookie("token" , token , cookieOption);
                res.status(200).json({
                    success:true,
                    message:"User login sucessfully",
                    data: newUser
                })
            } catch (error) {
                  return res.status(500).json({
                     success:false ,
                     message:"Something went wrong,Please try again.",
                     error:error.message
                    })
            }

}
//function for user logout
export const logout = (req , res) =>{
          try {
              const cookieOption ={
                 expires:new Date(),
                 httpOnly:true              
                }
                res.cookie("token",null,cookieOption);
                res.status(200).json({success:true,message:"Logout Successfully"});
          } catch (error) {
              res.status(400).status({success:false,message:"failed to logout",error:error.message});
          }
}
//function for get user information
export const getUserInfo = async (req , res) =>{
    const userID = req.user.id;
    try{
        const userInfo = await userModel.findById(userID);
        res.status(200).json({
            success:true,
            message:"successfully",
            data:userInfo
        })
    }catch(error){
        return res.status(400).json({success:false , message:error.message})
    }

}

//function for forgot password
