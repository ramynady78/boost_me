import { useMemo, useState } from "react";
import { useGetHabitsQuery } from "../RTK/slices/habitApi";
import AddNewHabit from "../components/AddHabitModel";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import AllHabitsComponent from "../components/AllHabitsComponent";
import { isSameDay } from "date-fns";

function HabitTrackerPage(){
    const isLoggedIn = localStorage.getItem("token")?.trim();
    const { data: allHabits } = useGetHabitsQuery(undefined, { skip: !isLoggedIn });

    const navigate = useNavigate()
    const [showAddHabit, setShowAddHabit] = useState(false);
    
    const habits = useMemo(() => {
        return allHabits?.data?.habits || [];
    }, [allHabits]);
    
    let maxCurrentStreak = 0 ;
    let todayHabits = [];
    if(habits.length > 0){
        maxCurrentStreak = habits.reduce((max , habit) =>
            habit.streak > max.streak ? habit : max
        )

        todayHabits = habits.filter(habit =>
            habit.history.some(entry =>
                isSameDay(new Date(entry.date), new Date())
            )
        );
        
    }

    const completedToday = habits.filter(habit =>
            habit.history.some(entry =>
                isSameDay(new Date(entry.date), new Date()) && entry.completed
            )
    )
  
    

    const stats = {
        totalHabits: habits.length || 0,
        currentStreak: maxCurrentStreak.streak || 0,
        completedToday: completedToday.length || 0,
    };
    const handleShowAddHabit = () => {
        if(isLoggedIn) {
            setShowAddHabit(true);
        } else {
            Swal.fire({
                title: 'Login Required!',
                text: 'You need to sign in first to add tasks',
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#10b981', 
                cancelButtonColor: '#6b7280',
                confirmButtonText: '<i class="bi bi-box-arrow-in-right"></i> Sign In',
                cancelButtonText: 'Cancel',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                customClass: {
                    popup: 'custom-swal-popup',
                    title: 'custom-swal-title',
                    confirmButton: 'custom-swal-confirm',
                    cancelButton: 'custom-swal-cancel'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login');
                }
            });
        }
    };

   

    return(
        <div className="container habit-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="page-icon">
                        <i className="bi bi-calendar-check"></i>
                    </div>
                    <div className="header-text">
                        <h1 className="page-title">Habit Tracker</h1>
                        <p className="page-subtitle">Build consistency and track your daily habits</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="add-habit-btn" onClick={handleShowAddHabit}>
                        <i className="bi bi-plus-lg"></i>
                        <span>Add New Habit</span>
                    </button>
                </div>
            </div>

            {/* Habits Statistics */}
            <div className="habits-statistics">
                <div className="stats-container">
                    <div className="stat-card total-habits">
                        <div className="stat-icon">
                            <i className="bi bi-graph-up-arrow"></i>
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-title">Total Habits</h3>
                            <p className="stat-number">{stats.totalHabits}</p>
                            {stats.totalHabits >=1 &&
                            <span className="stat-change positive">Great!</span>
                            }

                        </div>
                    </div>

                    <div className="stat-card streak-habits">
                        <div className="stat-icon">
                            <i className="bi bi-fire"></i>
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-title">Current Streak</h3>
                            <p className="stat-number">{stats.currentStreak}</p>
                            {stats.currentStreak >= 1 &&
                                <span className="stat-change positive">{maxCurrentStreak.title}</span>
                            }
                            
                        </div>
                    </div>

                    <div className="stat-card completed-today">
                        <div className="stat-icon">
                            <i className="bi bi-check2-circle"></i>
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-title">Completed Today</h3>
                            <p className="stat-number">{stats.completedToday}/{todayHabits.length || 0}</p>
                            {stats.completedToday >= 1 && 
                            <span className="stat-change positive">Keep going!</span>}
                        </div>
                    </div>

                    
                </div>
            </div>

            {/* show all habits */}

            {isLoggedIn && <AllHabitsComponent />}
            {showAddHabit && <AddNewHabit onCancel={()=> setShowAddHabit(false)}/> }
        </div>
    );
};

export default HabitTrackerPage;