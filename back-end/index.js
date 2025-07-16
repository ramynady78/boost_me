const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json())


const dbUrl = process.env.MONGO_URL;
mongoose.connect(dbUrl).then(() => {
    console.log("mogoDb server started")
})


app.get("/" , (req,res,next)=>{
    res.send("server run");
    next();
})

// user router
const userRouter = require('./router/user.router')
app.use("/api/users" , userRouter)

//userSettings router
const userSettingsRouter = require('./router/userSettings.router')
app.use("/api/user/setting" , userSettingsRouter)
// task router
const taskRouter = require('./router/task.router')
app.use("/api/tasks" , taskRouter);
// habit router
const habitRouter = require('./router/habit.router')
app.use("/api/habits" , habitRouter);

//pomodoro routrt
const pomodoroRouter = require('./router/pomodoro.router');
app.use("/api/pomodoro", pomodoroRouter)

app.use((error ,req , res , next) => {
    return res.status(error.statusCode || 500).json({
        status:error.statusText,
        message:error.message,
        code:error.statusCode,
        data:null
    })
})
app.listen(process.env.PORT , (req,res)=>{
    console.log(`server run in port ${process.env.PORT}`)
})