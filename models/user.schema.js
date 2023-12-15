import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';

const Schema = mongoose.Schema;

const userSchema = new Schema({
      fullName:{
          type:String,
          required:[true , 'Name is required'],
          minLength:[5 , 'Name should be at least 5 character'],
          maxLength:[30 , 'Name must be less then 30 character'],
          trim:true,
          lowercase:true
      },
      email:{
          type:String,
          required:[true , 'email is required'],
          lowercase:true,
          unique:true,
          trim:true
      },
      password:{
            type:String,
            required:[true , 'password must be required'],
            select:false,
            minLength:[8 , 'password at least 8 character']
      },
      avatar:{
             public_id:{
                type:String
             },
             secure_url:{
                type:String
             }
      },
      role:{
          type:String,
          enum:['USER','ADMIN'],
          default:'USER'

      },
      forgotPasswordToken:{String},
      forgotPasswordExpiry:{Date}
},{
    timestamps : true
})

// password bcrypt save 
userSchema.pre('save', async (next) =>{
       if(!this.isModified('password')){
          return next();
       }
       this.password = await bcrypt.hash(this.password , 10); 
       return next();
});

// jwtToken generating function
userSchema.methods = {
    generateJWTToken() {
           return JWT.sign(
             {id : this._id , email: this.email , role : this.role },
              process.env.SECRET,
             { ExpiresIn : '24h'}
            )
    }
}

const userModel = mongoose.model('user',userSchema);
export default userModel;
