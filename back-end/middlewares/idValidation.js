const mongoose  = require("mongoose");
const appErrors = require("../assenst/appErrors");

module.exports = (req,res,next)=>{
    const idKey = Object.keys(req.params).find(key => key.toLowerCase().endsWith("id"));
    const idValue = req.params[idKey];
    if(!mongoose.Types.ObjectId.isValid(idValue)){
        const error = appErrors.create("Invalid ID!", 400, "fail");
        return next(error)
    }
    next();
}