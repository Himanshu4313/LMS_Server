const authorizedRole = (...role) => async (req , res , next) =>{
    const currentUserRole = req.user.role;
  if(!role.includes(currentUserRole)){
       return res.status(400).json({sucess:false,message:"You have not permission to do this."})
  }
  next(); 
}

export default authorizedRole;