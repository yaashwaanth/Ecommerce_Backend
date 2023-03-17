const catchAsyncError = require("../middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorHandler");

const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto");
const cloudanary = require("cloudinary");


// Register a user
exports.registerUser =catchAsyncError(async(req,res,next)=>{

    const myCloud =await cloudanary.v2.uploader.upload(req.body.avatar,{
        folder:"avatars",
        width:150,
        crop:"scale"

    });
    const {name,email,password} = req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url,
        }
    });

    sendToken(user,201,res);
});

// Login user
// exports.loginUser=catchAsyncError(async(req,res,next)=>{

//     const {email,password}= req.body;
//     // checking user has given email and password both
    
//     if(!email || !password){
//         return next(new ErrorHander("Please Enter Email & Password",400))
//     }

//     const user=await User.findOne({email}).select("+password");
//     if(!user){
//         return next(new ErrorHander("Invalid email or password",401))
//     }
//     const isPasswordMatched = user.comparePassword(password);
//     // console.log(ispasswordMatched);
//     if(!isPasswordMatched){
//         return next(new ErrorHander("Invalid email or password",401))
//     }

//    sendToken(user,200,res);

// })

exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
  
    // checking if user has given password and email both
  
    if (!email || !password) {
      return next(new ErrorHander("Please Enter Email & Password", 400));
    }
  
    const user = await User.findOne({ email }).select("+password");
  
    if (!user) {
      return next(new ErrorHander("Invalid email or password", 401));
    }
  
    const isPasswordMatched = await user.comparePassword(password);
  
    if (!isPasswordMatched) {
      return next(new ErrorHander("Invalid email or password", 401));
    }
  
    sendToken(user, 200, res);
  });
  

// Logout User
exports.logOut = catchAsyncError(async(req,res,next)=>{
    
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true
    })

    res.status(200).json({
        success:true,
        message:"Logged Out"
    })
});


// Forget Password

exports.forgetPassword =catchAsyncError(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next(new ErrorHander("User Not Found",404));
    }
    
    // Get Reset Password Token
    const resetToken = user.getResetPasswordToken();
    
    await user.save({validateBeforeSave:false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email please ignore it`;

    try{

        await sendEmail({
            email:user.email,
            subject:`Ecommerce password recovery`,
            message,

        })

        res.send(200).json({
            success:true,
            message:`Email sent ${user.email} successfully`
        })


    }catch(error){
        user.getResetPasswordToken = undefined;
        user.resetPasswordExpire=undefined;
        await user.save({validateBeforeSave:false});
        return next(new ErrorHander(error.message,500))
    }
})

// Reset PassWord
exports.resetPassword = catchAsyncError(async(req,res,next)=>{

    // creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex"); 

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    });

    if(!user){
         return next(new ErrorHander("Reset Password Token is invalid or has been Expired",404));
        }

    if(req.body.password != req.body.confirmPassword){
        return next(new ErrorHander("Password does not match",400));
    }


    user.password =req.body.password;
    user.getResetPasswordToken = undefined;
    user.resetPasswordExpire=undefined;

    await user.save();

    sendToken(user,200,res);


});


// [3:26:00]

// get User details  -> user login kar raka ha
exports.getUserDetails = catchAsyncError(async(req,res,next)=>{

            const user = await User.findById(req.user.id)
            res.status(200).json({
                success:true,
                user
            })

})

// update password
exports.updatePassword = catchAsyncError(async(req,res,next)=>{

    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = user.comparePassword(req.body.oldPassword);
    if(!isPasswordMatched){
        return next(new ErrorHander(" old password is incorrect  ",401))
    }
    if(req.body.newPassword !== req.body.confirmPassword){
            return next(new ErrorHander("Password does not match",400));

    }

    user.password =req.body.newPassword;
    await user.save();


    sendToken(user,200,res);

});


// [3:34:00]
// update user profile
exports.updateProfile = catchAsyncError( async(req,res,next)=>{
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
    }

    if(req.body.avatar !== ""){
        const user = await User.findById(req.user.id);
        const imageId=user.avatar.public_id;
        await cloudanary.v2.uploader.destroy(imageId);

        const myCloud= await cloudanary.v2.uploader.upload(req.body.avatar,{
            folder:"avatars",
            width:150,
            crop:"scale"
        });
        newUserData.avatar={
            public_id:myCloud.public_id,
            url:myCloud.secure_url,
        }

    }

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,

    });
    res.status(200).json({
        success:true
    })
    
});

// [3:38:00]
// Get all users  [admin]

exports.getAllUsers = catchAsyncError(async(req,res,next)=>{
    const users = await User.find();
    res.status(200).json({
        success:true,
        users,
    })
});


// [3:39:28]
// Get single user  [admin]

exports.getSingleUser = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
        next(new ErrorHander(`User does not exist with Id : ${req.params.id}`))
    }
    res.status(200).json({
        success:true,
        user,
    })
});

//[3:42:38]
// update user Role -- Admin
exports.updateUserRole = catchAsyncError( async(req,res,next)=>{
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    }

    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,

    });
    res.status(200).json({
        success:true
    })
    
});


// Delete user -- Admin
exports.deleteUser = catchAsyncError( async(req,res,next)=>{
    const user = await User.findById(req.params.id);

    // we will add cloudanary later
      if(!user){
          next(new ErrorHander(`User does not exist with id : ${req.params.id}`));
      }
      await user.remove();
    res.status(200).json({
        success:true,
        message:"User deleted succesfully"
    })
    
});

