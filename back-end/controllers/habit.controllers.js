const appErrors = require('../assenst/appErrors');
const checkAchievingGoal = require('../assenst/checkAchievingGoal');
const asyncWrepper = require('../middlewares/asyncWrepper');

const Habit = require('../schemas/habitSchema')
//get all habits
const getAllHabits = asyncWrepper(
    async(req,res,next)=>{
        const currentUser = req.currentUser;

        const queryObject = {user:currentUser.id};

        const { repeat, date } = req.query;
        //fliter by repeat ['daily', 'weekly', 'monthly']
        if(repeat &&
          ['daily', 'weekly', 'monthly'].includes(repeat)){
            queryObject.repeat = repeat;
        };

        //fliter by single day 
        if(date){
          const targetDate = new Date(date);
          const nextDay  = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);

          queryObject.history = {
          $elemMatch: {
            date: {
              $gte: targetDate, //start 
              $lt: nextDay      //end
            }
          }
          };

        };

        const habits = await Habit.find(queryObject);
        res.status(200).json({
            status:"success",
            data:{
                habits
            }
        });
    }
);
// add a new habit
const createNewHabit = asyncWrepper(
    async(req,res,next)=>{
        const currentUser = req.currentUser.id;
        const {title,description,repeat,frequency,startDate , goalDays ,category} = req.body;
            
        if(!title|| !startDate ||  !repeat||
            !frequency  || !goalDays){
            const error = appErrors.create("habit info are required",400,"fail");
            return next(error);
        }
        const newHabit = new Habit({
            title,
            description,
            repeat,
            category,
            frequency,
            startDate,
            goalDays,
            user:currentUser,
            history:[
                {
                    date: startDate,
                    completed: false
                }
            ]

        })
        await newHabit.save()
        res.status(201).json({
            status:"success",
            data:{
                newHabit
            }
        });
        next();
    }
);
//get a single habit by id 
const getSingleHabit = asyncWrepper(
    async(req,res,next)=>{
      const habitId = req.params.habitId;
      const currentUserId = req.currentUser.id;

      const findHabit = await Habit.findOne({
          _id:habitId,
          user:currentUserId
      });
      if(!findHabit){
        const error = appErrors.create("Habit not found", 400 , "fail");
        return next(error);
      }

      res.status(200).json({
      status: "success",
      data: { habit:findHabit }
      });
    }  
);
//eddit habit 
const updateHabit = asyncWrepper(
  async (req, res, next) => {
    if (!req.body) {
      const error = appErrors.create("You should enter updates", 400, "fail");
      return next(error);
    }

    const currentUser = req.currentUser.id;
    const habitId = req.params.habitId;

    const habit = await Habit.findOne({ user: currentUser, _id: habitId });

    if (!habit) {
      const error = appErrors.create("Habit not Found!", 400, "fail");
      return next(error);
    }

    const { history } = req.body;
    const updateData = { ...req.body };

    if (history && Array.isArray(history)) {
      const newHistoryEntry = history[0];

      const newEntryDate = new Date(newHistoryEntry.date);
      newEntryDate.setUTCHours(0, 0, 0, 0);

      const existingEntry = habit.history.find(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setUTCHours(0, 0, 0, 0);
        return entryDate.getTime() === newEntryDate.getTime();
      });

      if (existingEntry) {
        delete updateData.history;

        await Habit.updateOne(
          {
            _id: habitId,
            user: currentUser,
            "history._id": existingEntry._id
          },
          {
            $set: {
              "history.$": newHistoryEntry,
              ...updateData
            }
          }
        );

      } else {
        delete updateData.history;

        await Habit.updateOne(
          { user: currentUser, _id: habitId },
          {
            $push: { history: newHistoryEntry },
            $set: updateData
          }
        );
      }
    } else {
      await Habit.updateOne({ user: currentUser, _id: habitId }, { $set: updateData });
    }

    
    const updatedHabit = await Habit.findOne({ user: currentUser, _id: habitId });
    checkAchievingGoal(updatedHabit)
    res.status(200).json({
      status: "success",
      data: { updatedHabit }
    });
  }
);

//delete habit 
const deleteHabit = asyncWrepper(
    async(req,res,next)=>{

      const currentUser = req.currentUser.id;
      const habitId = req.params.habitId;

      const findHabitAndDelete = await Habit.findOneAndDelete({
        _id:habitId,
        user:currentUser
      });

      if(!findHabitAndDelete){
        const error = appErrors.create("Habit not found", 400 , "fail");
        return next(error);
      };

      res.status(200).json({
        status:"success",
        data:null,
        message:"habit deleted"
      })
    }
);

module.exports = {
    getAllHabits,
    createNewHabit,
    getSingleHabit,
    updateHabit,
    deleteHabit
}