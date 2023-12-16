import JWT from 'jsonwebtoken';
const authJWT = (req , res , next) =>{
     const token = (req.cookies && req.cookies.token) || null;

     if(!token){
        return  res.status(400).json({success:false , message : "NOT Autherized user"});
     }

     //verfiy existing token 
     try{
     const payload = (JWT.verify(token , process.env.SECRET));
     req.user = {id:payload._id , email : payload.email , role:payload.role};
     }catch (error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      }
        next();
}
export default authJWT;