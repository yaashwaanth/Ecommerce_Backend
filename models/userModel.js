const mongoose=require("mongoose");
const validator =require("validator");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const crypto = require ("crypto");

const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter your Name"],
        maxLength:[30,"Name cannot exceed 30 charcaters"],

    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true,
        validator:[validator.isEmail,"please Enter a valid Email"],
    },
    password:{
        type:String,
        required:[true,"Plese Enter your Password"],
        minlength:[8,"Your password feild contain atleast 8 charcters "],
        select:false
    },
    avatar:{
        public_id:{
            type:String,
            // required:true
        },
        url:{
            type:String,
            // required:true
        }
    },
    role:{
        type:String,
        default:"user",
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
    ,
    resetPasswordToken:String,
    resetPasswordExpire:Date,
});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
       next();
    }
    this.password = await bcrypt.hash(this.password,10);
});

// JWT Token
userSchema.methods.getJWTToken = function (){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    })
};

// compare password
userSchema.methods.comparePassword = async function(enteredPassword){
  
    return await bcrypt.compare(enteredPassword,this.password);

}

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function(){

    // Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // hashing and adding to user schema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    this.resetPasswordExpire=Date.now() + 15 * 60 * 1000;

    return resetToken;
}

module.exports=mongoose.model("User",userSchema);