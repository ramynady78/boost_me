const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  repeat: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly']
  },
  category:{
    type:String,
    enum:['Health','Productivity','Learning','Mindfulness','Social','Creative','Other'],
    default:'Productivity'
  },
  frequency: { 
    type: Number,
    default: 1
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  goalDays: {
    type: Number,
    required: true,
    min: 1,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  history: [{
    date: {
      type:Date,
      default: Date.now
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  achievingGoal:{
    type:Boolean,
    default:false
  },
  completedDays:{
    type:Number,
    default:0
  },
  streak:{
    type:Number,
    default:0
  }
});




const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;