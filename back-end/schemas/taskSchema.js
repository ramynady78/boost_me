const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    taskTitle:{
        type: String,
        trim: true,
        required: true
    },
    taskDate:{
        type: Date,
        required: true
    },
    taskStatus:{
        type: String,
        enum: ['Done', 'In Progress', 'Not Started'],
        default: 'Not Started'
    },
    taskDescription:{
        type: String,
        trim: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true  
});

module.exports = mongoose.model("Task", taskSchema);