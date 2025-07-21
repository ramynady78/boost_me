
const appErrors = require("../assenst/appErrors");
const asyncWrepper = require("../middlewares/asyncWrepper");

const UserSetting = require("../schemas/userSettingsSchema");


const getUserSettings= asyncWrepper(
    async(req, res , next) =>{
        let userSettings = await UserSetting.findOne({user: req.currentUser.id});
       if (req.currentUser.id && !userSettings) {
            const newUserSettings = await UserSetting.create({
            user: req.currentUser.id,
            focusTime: 25,
            shortBreak: 5,
            longBreak: 15,
            roundsBeforeLongBreak: 4,
            });
            userSettings = newUserSettings
        }

        res.status(200).json({
            status:"success",
            data:{
                userSettings  
            }
        });
    }
);
const updateUserSettings= asyncWrepper(
    async(req, res , next) =>{
        const findUser = await UserSetting.findOne({user: req.currentUser.id});
        if(!findUser){
          const error = appErrors("User not Found", 400 , "fail");
          return next(error)
        };

        if(!req.body){
            const error = appErrors("Setting Info is required", 400 , "fail");
            return next(error)
        };

        await UserSetting.findOneAndUpdate(
            {user: req.currentUser.id}, 
            {$set: req.body},
            {new: true} 
        );

        res.status(201).json({
            status:"success",
            data:null,
            message:"User setting updated success"
        });
    }
);

module.exports = {
    getUserSettings,
    updateUserSettings
}