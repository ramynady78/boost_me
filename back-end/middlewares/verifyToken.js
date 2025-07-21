const jwt = require('jsonwebtoken');
const appErrors = require('../assenst/appErrors');


const verifyToken = async(req,res,next)=>{
    const authHeadr = req.headers['Authorization'] || req.headers['authorization'];
    if(!authHeadr){
        const error = appErrors.create("token is required" , 401 , "error")
        return next(error)
    }
    const token = authHeadr.split(" ")[1];
    try{
        const currentUser = jwt.verify(token , process.env.JWT_SECRET_key);
        req.currentUser = currentUser;
        next()
    }catch{
        const error = appErrors.create("invailed token" , 401 , "error")
        return next(error);
    }

};

module.exports = {
    verifyToken
}