const mongoose = require("mongoose");

const pomodoroSchema =new  mongoose.Schema({
    sessionName:{
        type:String,
        required:true
    },
    sessionType:{
        type:String,
        enum:['focus', 'short_break', 'long_break'],
        default:"focus"
    },
    duration:{
        type:Number, // مده الجلسه بالدقائق
        default:25
    },  
    startedAt: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'inProgress', 'completed', 'interrupted'],
        default: 'pending'
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }

});

module.exports = mongoose.model("pomodoro",pomodoroSchema)