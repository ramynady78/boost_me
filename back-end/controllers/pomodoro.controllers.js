
const appErrors = require("../assenst/appErrors");
const asyncWrepper = require("../middlewares/asyncWrepper");
const Pomodoro = require("../schemas/pomodoroSchema");

//get All PomodoroSessions
const getAllPomodoroSessions = asyncWrepper(
    async(req,res,next) => {
        const currentUser = req.currentUser;

        const allPomodoroSessions = await Pomodoro.find({user:currentUser.id});

        res.status(200).json({
            status:"success",
            data:{
                allPomodoroSessions
            }
        })
    }
);

//create New PomodoroSession
const createNewPomodoroSession = asyncWrepper(
    async(req,res,next) => {
        const {sessionName, sessionType, duration, status, task, notes} = req.body;
        const currentUser = req.currentUser;

        if(!sessionName|| !sessionType|| !duration|| !status){
            const error = appErrors.create("Pomodore session info are required",400,"fail");
            return next(error)
        };

        const newPomodoreSession = new Pomodoro({
            sessionName, 
            sessionType,
            duration,
            status,
            task,
            notes,
            user:currentUser.id
        });
        await newPomodoreSession.save();

        res.status(201).json({
            status:"success",
            data:{
                newPomodoreSession
            }
        });
    }
);
//get Single Pomodoro Session by id
const getSinglePomodoroSession = asyncWrepper(
    async(req,res,next) => {
        const currentUser = req.currentUser;
        const {sessionId} = req.params;

        const session = await Pomodoro.find({_id:sessionId , user:currentUser.id});

        if(!session){
            const error = appErrors.create("Session not found!", 400 , "fail");
            return next(error)
        }
        res.status(200).json({
            status:"success",
            data:{session}
        })

    }
);

//update session
const updatePomodoroSession = asyncWrepper(
    async(req,res,next) => {
        if(!req.body){
            const error = appErrors.create("You should enter any updats" , 400 , "fail")
            return next(error)
        }
        const currentUser = req.currentUser;
        const {sessionId} = req.params;

        const findSession = await Pomodoro.findOneAndUpdate(
            {_id: sessionId, user: currentUser.id}, 
            {$set: req.body},
            {new: true}
        );
        if(!findSession){
            const error = appErrors.create("Session not found!", 400 , "fail");
            return next(error)
        };
        const UpdatedSession = await Pomodoro.find({_id:sessionId , user:currentUser.id});

        res.status(200).json({
            status:"success",
            data:{
                UpdatedSession
            }
        });

    }
);

//delete session 

const deletePomodoroSession = asyncWrepper(
    async(req, res, next)=> {
        const currentUser = req.currentUser;
        const {sessionId} = req.params;

        const findSession = await Pomodoro.findOneAndDelete({ _id:sessionId, user:currentUser.id});
        
        if(!findSession){
            const error = appErrors.create("Session not found!", 400 , "fail");
            return next(error)
        };

        res.status(200).json({
            status:"success",
            data:null,
            message:"Session deleted!"
        })

    }
);
const clearAllPomodoroSessions = asyncWrepper(
    async(req, res, next)=> {
        const currentUser = req.currentUser;

        await Pomodoro.deleteMany({user:currentUser.id})
        res.status(200).json({
            status:"success",
            data:null,
            message:"data Cleared!"
        })

    }
);



module.exports = {
    getAllPomodoroSessions,
    getSinglePomodoroSession,
    createNewPomodoroSession,
    updatePomodoroSession,
    deletePomodoroSession,
    clearAllPomodoroSessions
}