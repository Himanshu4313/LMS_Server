import mongoose from "mongoose";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { config } from "dotenv";
import crypto from "crypto";
import { networkInterfaces } from "os";
config();
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Name is required"],
      minLength: [5, "Name should be at least 5 character"],
      maxLength: [30, "Name must be less then 30 character"],
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      lowercase: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password must be required"],
      select: false,
      minLength: [8, "password at least 8 character"],
    },
    avatar: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// password bcrypt save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);

  return next();
});

// jwtToken generating function
userSchema.methods = {
  generateJWTToken() {
    try {
      // This sign function take three argument sign({data},secretKey , {expiresIn:"24h"})
      return JWT.sign(
        {
          id: this._id,
          email: this.email,
          role: this.role,
          subscription: this.subscription,
        },
        process.env.SECRET,
        {
          expiresIn: 7 * 24 * 60 * 60 * 1000,
        }
      );
    } catch (error) {
      console.log("JWT generating ", error);
      throw new Error("Failed to generate token");
    }
  },

  //This token is generate for forgot password
  generateJWTResetToken() {
    const resetToken = crypto.randomBytes(20).toString("hex");

    //if resetToken is generate then we assign this token in forgotPasswordToken that is mention in userSchema.
    this.forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; //15 min from now

    return resetToken;
  },
};

const userModel = mongoose.model("user", userSchema);
export default userModel;
