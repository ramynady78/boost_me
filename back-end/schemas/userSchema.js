const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    userName:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate:[validator.isEmail , "failed must be email"]
    },
    password:{
        type:String,
        requiredd:true,
    validate: {
      validator: function (value) {
        return validator.isStrongPassword(value, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        });
      },
      message: 'Password is not strong enough'
    }
    },
    token:{
        type:String
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    OTP:{
        type:String,
    },
    otpExpires:{
        type:Date,
    },
    avater:{
        type:String,
        default:"uplads/profile.png"
    }
});
module.exports = mongoose.model("User" , userSchema);