const mongoose = require('mongoose');


const userSettingsSchema = new mongoose.Schema({
  user:{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  
    required: true 
  },
  focusTime:{
    type: Number,
    default: 25 
  },
  shortBreak:{
    type: Number,
    default: 5 
  },
  longBreak:{
    type: Number,
    default: 15
  },
  roundsBeforeLongBreak:{ 
    type: Number,
    default: 4
  }
});

module.exports = mongoose.model("UserSetting" , userSettingsSchema);