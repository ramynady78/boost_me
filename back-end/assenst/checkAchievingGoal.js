module.exports = async (habit) => {
    const completedDays = habit.history.filter(entry => entry.completed === true).length;
    habit.completedDays = completedDays;
    habit.achievingGoal = completedDays >= habit.goalDays;

    //calc streak 
    let streak = 0;
    let maxStreak = 0;
    habit.history.forEach(entry => {
        if(entry.completed === true){
            streak++
        }else{
            maxStreak = Math.max(streak, maxStreak);
            streak = 0;

        }
    });
    maxStreak = Math.max(streak, maxStreak);
    habit.streak = maxStreak;
    await habit.save();
}


// "completed": true,
// "completed": true,
// "completed": true,
// "completed": false,
// "completed": true,
// "completed": false,
// "completed": true,

