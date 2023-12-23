import userModel from "../models/user.schema.js";
import bcrypt from "bcrypt";
import emailValid from "email-validator";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import crypto from "crypto";
import sendEmail from "../utils/send.email.js";
//function for user registeration
export const getRegisteration = async (req, res) => {
  const { fullName, email, password, avatar } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are mandatory" });
  }

  if (!emailValid.validate(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter correct email" });
  }
  try {
    const userExists = await userModel.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User can already register",
      });
    }

    const newUser = await userModel.create({
      fullName,
      email,
      password,
      avatar: {
        public_id: email,
        secure_url: avatar,
      },
    });

    //this code will run when above create function is not working
    if (!newUser) {
      res.status(400).json({
        success: false,
        message: "User registration failed please try again",
      });
    }

    // upload file in cloudinary
    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });

        if (result) {
          newUser.avatar.public_id = result.public_id;
          newUser.avatar.secure_url = result.secure_url;
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
    await newUser.save();

    // console.log(newUser);
    const token = await newUser.generateJWTToken();
    // console.log(token);
    newUser.password = undefined;

    const cookieOption = {
      maxAge: 7 * 24 * 60 * 60 * 1000, //7day
      httpOnly: true,
      secure: true,
    };
    res.cookie("token", token, cookieOption);
    res.status(200).json({
      success: true,
      message: "User register sucessfully",
      data: newUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to register",
      error: error,
    });
  }
};
//function for user login
export const loggedIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }
  if (!emailValid.validate(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter correct email address",
    });
  }
  try {
    const userExists = await userModel.findOne({ email }).select("+password");
    console.log(userExists);
    if (!userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exists" });
    }

    //if user can exists
    if (!userExists || !(await bcrypt.compare(password, userExists.password))) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }

    //if all condition are true then

    const token = await userExists.generateJWTToken();

    userExists.password = undefined;

    const cookieOption = {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: true,
    };
    res.cookie("token", token, cookieOption);
    res.status(200).json({
      success: true,
      message: "User login sucessfully",
      user: userExists,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong,Please try again.",
      error: error.message,
    });
  }
};
//function for user logout
export const logout = (req, res) => {
  try {
    const cookieOption = {
      expires: new Date(),
      httpOnly: true,
      maxAge: 0,
      secure: true,
    };
    res.cookie("token", null, cookieOption);
    res.status(200).json({ success: true, message: "Logout Successfully" });
  } catch (error) {
    res.status(400).status({
      success: false,
      message: "failed to logout",
      error: error.message,
    });
  }
};
//function for get user information
export const getUserInfo = async (req, res) => {
  try {
    const userID = req.user.id;
    const userInfo = await userModel.findById(userID);
    res.status(200).json({
      success: true,
      message: "successfully",
      data: userInfo,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to fetch user details",
      error: error.message,
    });
  }
};

//function for forgot password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  // if email has the check this email user is exists in database or not
  const User = await userModel.findOne({ email });

  if (!User) {
    return res
      .status(400)
      .json({ success: false, message: "This email is not registered." });
  }

  // if user register exists then generate resetToken
  // this generateJWTResetToken function write in UserSchema file
  const resetToken = User.generateJWTResetToken();
  await User.save();

  // we create URL those send in user email address
  const resetPasswordURL = `${process.env.FRONTEND_CLIENT_URL}/reset-password/${resetToken}`;

  const subject = "Reset password";
  const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}.\n If you have not requested this, kindly ignore.`;

  try {
    await sendEmail(email, subject, message);
    res.status(200).json({
      success: true,
      message: `Reset password token has been sent to ${email} successfully.`,
    });
  } catch (error) {
    // i set forgotPasswordToken and forgotPasswordExpiry undefined because when token is generate but email can not be sent to user in this sanerio we set both undefined , then user try again to set password.
    User.forgotPasswordToken = undefined;
    User.forgotPasswordExpiry = undefined;
    await User.save();
    return res.status(500).json({ success: false, message: error });
  }
};
//function for reset password
export const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Please enter your password.",
    });
  }
  try {
    const forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await userModel.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "User does not exist with same token or token is expires.please try again",
      });
    }

    user.password = password;
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// function for change password
export const changePassword = async (req, res) => {
  // step of change password are
  // first we take old password and new password from the user
  const { oldPassword, newPassword } = req.body;
  const { id } = req.user;
  // check validation
  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  //    // then check the given old password is correct or not
  //  const oldPasswordhax = await bcrypt.hash(oldPassword , 10); // convert row password into hash because password store in database as hash form.
  try {
    const user = await userModel.findById(id).select("+password");

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({
        success: false,
        message: "Your oldPassword is incorrect.Please try again",
      });
    }

    user.password = newPassword;
    await user.save();
    user.password = undefined;

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// function for user updateProfile

export const updateProfile = async (req, res) => {
  const { fullName } = req.body;
  const { id } = req.user;

  try {
    const userExists = await userModel.findById(id);

    if (!userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exists" });
    }

    if (fullName) {
      userExists.fullName = fullName;
    }

    // this is run when user can change profile photo

    // first we destroy securl url from cloudinary
    await cloudinary.v2.uploader.destroy(userExists.avatar.public_id);
    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });

        if (result) {
          userExists.avatar.public_id = result.public_id;
          userExists.avatar.secure_url = result.secure_url;
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

    // if any one change or both
    await userExists.save();
    res
      .status(200)
      .json({ success: true, message: "User profile updated sucessfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed update your profile.Please try again",
    });
  }
};
