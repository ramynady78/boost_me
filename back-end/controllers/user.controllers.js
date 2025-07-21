const appError = require('../assenst/appErrors');
const generateJwtToken = require('../assenst/generateJwtToken');
const sendVerfiyEmail = require('../assenst/sendVerfiyEmail');
const asyncWrepper = require('../middlewares/asyncWrepper');
const User = require('../schemas/userSchema');

const bcrypt = require('bcrypt');






//get all users
const getAllUsers = asyncWrepper(
    async (req,res ,next)=>{
        const allUsers = await User.find({},{__v:0 , password:0, token:0})
        res.status(200).json({
            status:"success",
            data:{
                users:allUsers
            }
        });
        // next();
    }
);
// resister a new user
const register = asyncWrepper(
    async(req,res,next) =>{
    const {firstName,lastName,userName,email,password} = req.body;
    const oldUser = await User.findOne({email:email});
    
    if (oldUser) {
        if (oldUser.isVerified) {
            const error = appError.create("This email is already registered.", 400, "fail");
            return next(error);
        } else {
            const error = appError.create("This email is already registered but not verified. Please verify your email.", 400, "fail");
            return next(error);
        }
    };
    // generit random OTP 
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashOtp= await bcrypt.hash(otp , 10);
    //otp expires
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    
    //hash password
    const hashPassword = await bcrypt.hash(password , 10)

    const newUser = new User({
        firstName,
        lastName,
        userName,
        email,
        password:hashPassword,
        OTP:hashOtp,
        otpExpires
    });

    

    // send a random OTP 
    await sendVerfiyEmail(email, otp);

    await newUser.save();
    res.status(201).json({
        status : "success",
        message:`You received a verification email at ${email}`,
        data:{user: {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          userName: newUser.userName,
          email: newUser.email
        }}
    })
}
);

// verfiy email 
const verfiy = asyncWrepper(
    async(req,res,next)=>{
        const {email , otpCode} = req.body;
        if(!email || !otpCode){
            error = appError.create("email and code are erquired" , 400 , "fail");
            return next(error)
        };
        const user =await User.findOne({email:email});
        if(!user){
            error = appError.create("user isn't found please try again" , 400 , "fail");
            return next(error);
        }
        if(user.otpExpires > new Date()){
            const matchOtpCode = await bcrypt.compare(otpCode , user.OTP);
            if(!matchOtpCode){
                error = appError.create("Code isn't correct , try again!" , 400 , "error");
                return next(error)
            }
        }else{
            error = appError.create("Code is expired" , 400 , "error");
            return next(error)
        }
        
        user.isVerified = true;
        user.OTP = null;
        user.otpExpires = null;

        //generate jwt token
        const token = await generateJwtToken(
            {
                email:user.email,
                id:user._id,
                firstName:user.firstName,
                lastName:user.lastName
            }
        );

        user.token = token;
        await user.save();

        res.status(200).json({
            status:"success",
                data : {
                    message:"Account Verfied",
                    token,
                }
        })
    }
);
// resend OTP
const resendOtp = asyncWrepper(
  async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
      const error = appError.create("Email is required", 400, "fail");
      return next(error);
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = appError.create("User not found", 400, "fail");
      return next(error);
    }
    if (user.isVerified) {
      const error = appError.create("Account already verified", 400, "fail");
      return next(error);
    }

    // generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    user.OTP = hashOtp;
    user.otpExpires = otpExpires;
    await user.save();

    // send new OTP
    await sendVerfiyEmail(email, otp)
  

    res.status(200).json({
      status: "success",
      message: `A new verification code has been sent to ${email}`
    });
  }
);
//login 
const login = asyncWrepper(
    async (req,res,next)=>{
        const{email , password} = req.body;

        if(!email || !password){
            error = appError.create("email and password are erquired" , 400 , "fail");
            return next(error)
        };

        const user = await User.findOne({email:email});
        if(!user){
            error = appError.create("User not found. Please try again." , 400 , "fail");
            return next(error)
        };

       if (!user.isVerified) {
            const error = appError.create("Your account is not verified. Please verify your email first.", 400, "fail");
            return next(error);
        }

        const matchPassword = await bcrypt.compare(password , user.password);

        if(!matchPassword){
            error = appError.create("Incorrect password. Please try again." , 400 , "error");
            return next(error)
        }

        if(user && matchPassword){
            const token =await generateJwtToken( {
            email:user.email,
            id:user._id,
            firstName:user.firstName,
            lastName:user.lastName
            });
            
            return res.status(200).json({
                status:"success",
                data : {
                    message:"Logged in successfully",
                    token :token
                }
            })
        }else{
            const error = appError.create("Somthing wrong please rty again",500,"fail");
            return next(error)
        }

    }
);

//after finshed i will creare end point, to forget passwod

module.exports ={
    getAllUsers,
    register,
    verfiy,
    resendOtp,
    login
}
