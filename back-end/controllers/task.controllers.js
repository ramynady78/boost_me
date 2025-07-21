const appErrors = require('../assenst/appErrors');
const asyncWrepper = require('../middlewares/asyncWrepper');

const Task = require('../schemas/taskSchema')
//get all tasks
const getAllTasks = asyncWrepper(
    async(req,res,next)=>{
        const currentUser = req.currentUser;
        

        const queryObject = {user:currentUser.id};

        //fliter by (status)
        if(req.query.status){
            queryObject.taskStatus = req.query.status;
        }

        //fliter by date (from)
        if(req.query.from){
            queryObject.taskDate = { $gte: new Date(req.query.from) };
        }
        //to
        if(req.query.to){
            if(!queryObject.taskDate){
                queryObject.taskDate = {}
            }
            queryObject.taskDate.$lte = new Date(req.query.to);

        }
        const tasks = await Task.find(queryObject).sort({ taskDate: 1 });
        res.status(200).json({
            status:"success",
            data:{
                tasks:tasks
            }
        });
    }
);
// add a new task
const createNewTask = asyncWrepper(
    async(req,res,next)=>{
        const {taskTitle , taskDate ,taskStatus ,taskDescription } = req.body;
        const currentUser = req.currentUser;
        if(!taskTitle || !taskDate || !taskStatus ){
            const error = appErrors.create("task info are required",400,"fail");
            return next(error)
        }
        const newTask = new Task({
            taskTitle ,
            taskDate,
            taskStatus ,
            taskDescription ,
            user: currentUser.id 
        });
        await newTask.save()
        
        res.status(201).json({
            status:"success",
            data:{
                newTask
            }
        });

    }
);
//get a single task by id 
const getSingleTask = asyncWrepper(
    async(req,res,next)=>{
        const {taskId} = req.params;

        const task = await Task.findOne({_id:taskId, user:req.currentUser.id});
        if(!task){
            const error = appErrors.create("Task not found!" , 400 , "fail")
            return next(error)
        };
         res.status(200).json({
            status:"success",
            data:{
                task
            }
        });
        next();
    }
);
//eddit task 
const updateTask = asyncWrepper(
    async(req,res,next)=>{
        if(!req.body){
            const error = appErrors.create("You should enter any updats" , 400 , "fail")
            return next(error)
        }
        const findTask = await Task.findOneAndUpdate(
            {_id: req.params.taskId, user: req.currentUser.id}, 
            {$set: req.body},
            {new: true}  // عشان يرجع الـ document المحدث
        );
        if(!findTask){
            const error = appErrors.create("Task not found!" , 400 , "fail")
            return next(error)
        }
        const updatedTask = await Task.findOne({_id:req.params.taskId, user:req.currentUser.id});
        res.status(200).json({
            status:"success",
            data:{
                updatedTask
            }
        });

    }
);
//delete task 
const deleteTask = asyncWrepper(
    async(req,res,next)=>{
        const findTask = await Task.findOneAndDelete({_id:req.params.taskId, user:req.currentUser.id} , {$set: {...req.body}});
        if(!findTask){
            const error = appErrors.create("Task not found!" , 400 , "fail")
            return next(error)
        }
        res.status(200).json({
            status:"success",
            data:null,
            message:"Task deleted!"
        });
        next();
    }
);

module.exports = {
    getAllTasks,
    createNewTask,
    getSingleTask,
    updateTask,
    deleteTask
}