import { useState, useMemo } from "react";
import { useDeleteHabitMutation, useGetHabitsQuery, useUpdateHabitMutation } from "../RTK/slices/habitApi";
import { 
    format,              //format(date, formatString) → Converts a Date to a formatted string (e.g. "yyyy-MM-dd")
    startOfWeek,         //startOfWeek(date, options) → Gets the first day of the week from a given date
    addDays,             //addDays(date, number) → Returns a new Date increased/decreased by a number of days
    isSameDay,           //isSameDay(date1, date2) → Checks if two dates are on the same calendar day
    addWeeks,             //addWeeks(date, number) → Returns a new Date increased/decreased by a number of weeks
    parseISO
} from 'date-fns';
import Swal from "sweetalert2";
import EditHabitModal from "./EdditHabitModel";
import HabitInfoModal from "./HabitInfoModel";


// Custom hook للعادات
const useHabitsLogic = (allHabits, selectedDate) => {
    const habits = useMemo(() => {
        return allHabits?.data?.habits || [];
    }, [allHabits]);

    // حساب الأسبوع الحالي
    const currentWeek = useMemo(() => {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }, [selectedDate]);

    // فلترة العادات للتاريخ المحدد
    const filteredHabits = useMemo(() => {
        return habits.filter(habit => shouldShowHabitOnDate(habit, selectedDate));
    }, [habits, selectedDate]);

    // حساب عدد العادات لكل يوم
    const getHabitsCountForDate = (date) => {
        return habits.filter(habit => shouldShowHabitOnDate(habit, date)).length;
    };

    return {
        habits,
        currentWeek,
        filteredHabits,
        getHabitsCountForDate
    };
};


// منطق العادات مبسط
const shouldShowHabitOnDate = (habit, targetDate) => {
    const habitStartDate = new Date(habit.startDate);
    const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const startDateOnly = new Date(habitStartDate.getFullYear(), habitStartDate.getMonth(), habitStartDate.getDate());
    
    // إذا كان التاريخ المطلوب قبل بداية العادة
    if (targetDateOnly < startDateOnly) return false;
    
    // checked if achecing goal  or not 
    const exists = habit.history.find(h =>
            isSameDay(parseISO(h.date), targetDate));
        
    if(habit.achievingGoal && !exists) return false;


    switch (habit.repeat) {
        case 'daily':
            return true;
        
        case 'weekly':
            const targetDayOfWeek = targetDateOnly.getDay();
            const startDayOfWeek = startDateOnly.getDay();
            
            // للعادات الأسبوعية البسيطة (مرة واحدة في الأسبوع)
            if (habit.frequency === 1) {
                return targetDayOfWeek === startDayOfWeek;
            }
            
            // للعادات المتعددة في الأسبوع
            const weeklyPattern = getWeeklyPattern(startDayOfWeek, habit.frequency);
            return weeklyPattern.includes(targetDayOfWeek);
        
        case 'monthly':
            const startDay = startDateOnly.getDate();
            const targetDay = targetDateOnly.getDate();
            
            // للعادات الشهرية البسيطة (مرة واحدة في الشهر)
            if (habit.frequency === 1) {
                return startDay === targetDay;
            }
            
            // للعادات المتعددة في الشهر
            const monthlyPattern = getMonthlyPattern(startDay, habit.frequency);
            return monthlyPattern.includes(targetDay);
        
        default:
            return false;
    }
};

// نمط العادات الأسبوعية
const getWeeklyPattern = (startDay, frequency) => {
    if (frequency >= 7) return [0, 1, 2, 3, 4, 5, 6];
    const pattern = [];
    const spacing = Math.max(1, Math.floor(7 / frequency)); // 2
    
    for (let i = 0; i < frequency; i++) {
        pattern.push((startDay + i * spacing) % 7);
    }
    return [...new Set(pattern)]; // إزالة التكرار
};

// نمط العادات الشهرية
const getMonthlyPattern = (startDay, frequency) => {
    if (frequency >= 30) return Array.from({ length: 31 }, (_, i) => i + 1);
    
    const pattern = [];
    const spacing = Math.max(1, Math.floor(30 / frequency));
    
    for (let i = 0; i < frequency; i++) {
        const day = Math.min(startDay + i * spacing, 31);
        if (day >= 1 && day <= 31) {
            pattern.push(day);
        }
    }
    
    return [...new Set(pattern)];
};

function AllHabitsComponent() {
    const isLoggedIn = localStorage.getItem("token")?.trim();
    const { data: allHabits, isLoading, error } = useGetHabitsQuery(undefined, { skip: !isLoggedIn });
    const [updateHabits ] = useUpdateHabitMutation();
    const [deleteHabit] = useDeleteHabitMutation();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [showEditHabitModal, setShowEditHabitModal] = useState(false);
    const [showHabitInfoModal, setShowHabitInfoModal] = useState(false);

    

    
    // استخدام الـ custom hook
    const {
        currentWeek,
        filteredHabits,
    } = useHabitsLogic(allHabits, selectedDate);
    // if want week start in saturday change her elso
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const navigateWeek = (direction) => {
        setSelectedDate(addWeeks(selectedDate, direction));
    };

    const selectDateFn = (date) => {
        setSelectedDate(new Date(date));
    };

    const isToday = (date) => isSameDay(date, new Date());
    const isSelected = (date) => isSameDay(date, selectedDate);

    // updata habit
    function getUTCDateWithoutTime(date) {
    const d = new Date(date);
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    }

    const recordForDate = (habit)=> {
        return habit.history.find(h =>
            isSameDay(parseISO(h.date), selectedDate));

    }
    const toggleHabitCompletion = (habit) => {
        const normalizedSelectedDate = getUTCDateWithoutTime(selectedDate);
        let habitCompletion = true;
        if (recordForDate(habit)) {
            habitCompletion = recordForDate(habit).completed ? false : true;
        }

        updateHabits({
            habitId: habit._id,
            formData: {
            history: [
                {
                date: normalizedSelectedDate.toISOString(), 
                completed: habitCompletion
                }
            ]
            }
        });
    };

    const getHabitIcon = (habit) => {
        const icons = {
            'Health': 'bi-heart-pulse',
            'Productivity': 'bi-briefcase',
            'Learning': 'bi-book',
            'Mindfulness': 'bi-peace',
            'Social': 'bi-people',
            'Creative': 'bi-palette',
            'default': 'bi-star'
        };
        return icons[habit.category] || icons.default;
    };

    const getHabitFrequencyText = (habit) => {
        if (habit.frequency === 1) {
            return `Once ${habit.repeat}`;
        }
        return `${habit.frequency}x ${habit.repeat}`;
    };

    if (isLoading) {
        return (
            <div className="all-habits-container">
                <div className="habits-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading habits...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="all-habits-container">
                <div className="habits-error">
                    <i className="bi bi-exclamation-triangle"></i>
                    <p>Error loading habits</p>
                    <button onClick={() => window.location.reload()}>Try Again</button>
                </div>
            </div>
        );
    };
    const handleViewHabitInfo = (habit) =>{
        setSelectedHabit(habit)
        setShowHabitInfoModal(true)
    };
    const handleEditHabit = (habit) =>{
        setSelectedHabit(habit)
        setShowEditHabitModal(true)
    };
    const handleDeleteHabit = async (habitId ,habitTitle) =>{
        const result = await Swal.fire({
                title: 'Delete Habit?',
                text: `Are you sure you want to delete "${habitTitle}"? The habit's history will also be delete`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: '<i class="bi bi-trash"></i> Delete',
                cancelButtonText: 'Cancel',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                customClass: {
                    popup: 'custom-swal-popup',
                    title: 'custom-swal-title',
                    confirmButton: 'custom-swal-confirm',
                    cancelButton: 'custom-swal-cancel'
                }
            });
        
            if (result.isConfirmed) {
                try {
                    await deleteHabit({habitId}).unwrap();
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Habit has been deleted successfully.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                    });
                } catch (error) {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to delete habit. Please try again.',
                        icon: 'error',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                    });
                }
            }
    };

    return (
        <div className="all-habits-container">
            {/* Weekly Calendar */}
            <div className="habits-calendar">
                <div className="calendar-header">
                    <button 
                        className="nav-btn prev-btn" 
                        onClick={() => navigateWeek(-1)}
                        title="Previous Week"
                    >
                        <i className="bi bi-chevron-left"></i>
                    </button>
                    
                    <div className="week-info">
                        <h3 className="current-month">
                            {format(selectedDate, 'MMMM yyyy')}
                        </h3>
                        <p className="week-range">
                            {format(currentWeek[0], 'MMM d')} - {format(currentWeek[6], 'MMM d')}
                        </p>
                    </div>
                    
                    <button 
                        className="nav-btn next-btn" 
                        onClick={() => navigateWeek(1)}
                        title="Next Week"
                    >
                        <i className="bi bi-chevron-right"></i>
                    </button>
                </div>

                <div className="week-days">
                    {currentWeek.map((date, index) => {
                        
                        return (
                            <div 
                                key={index}
                                className={`day-item ${isSelected(date) ? 'selected' : ''} ${isToday(date) ? 'today' : ''}`}
                                onClick={() => selectDateFn(date)}
                            >
                                <div className="day-name">{weekDays[index]}</div>
                                <div className="day-number">{format(date, 'd')}</div>
                                
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected Date Info */}
            <div className="habits-date-info">
                <h2 className="selected-date-title">
                    <i className="bi bi-calendar-day"></i>
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h2>
                <p className="habits-count">
                    {filteredHabits.length} habit{filteredHabits.length !== 1 ? 's' : ''} for this day
                </p>
            </div>

            {/* Habits List */}
            <div className="habits-content">
                {filteredHabits.length === 0 ? (
                    <div className="no-habits">
                        <div className="no-habits-icon">
                            <i className="bi bi-calendar-x"></i>
                        </div>
                        <h3>No habits for this day</h3>
                        <p>Add some habits to start building your routine!</p>
                    </div>
                ) : (
                    <div className="habits-grid">
                        {filteredHabits.map((habit) => (
                            <div key={habit._id} className="habit-card">
                                <div className="habit-header">
                                    <div className="habit-icon">
                                        <i className={`bi ${getHabitIcon(habit)}`}></i>
                                    </div>
                                    <div className="habit-info">
                                        <h3 className="habit-title">{habit.title}</h3>
                                        <p className="habit-frequency">
                                            {getHabitFrequencyText(habit)}
                                        </p>
                                    </div>
                                    <button 
                                        className={`completion-btn ${recordForDate(habit)?.completed ? 'completed' : ''}`}
                                        onClick={() => toggleHabitCompletion(habit)}
                                        title={recordForDate(habit)?.completed ? 'Mark as incomplete' : 'Mark as complete'}
                                    >
                                        <i className={`bi ${recordForDate(habit)?.completed ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                                    </button>
                                </div>
                                
                                {habit.description && (
                                    <div className="habit-description">
                                        <p>{habit.description}</p>
                                    </div>
                                )}
                                
                                <div className="habit-footer">
                                    <div className="habit-streak">
                                        <i className="bi bi-fire"></i>
                                        <span>{habit.streak || 0} day streak</span>
                                    </div>
                                    <div className="habit-progress">
                                        <span className="progress-text">
                                            {habit.completedDays || 0}/{habit.goalDays} days
                                        </span>
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill"
                                                style={{ 
                                                    width: `${Math.min(((habit.completedDays || 0) / habit.goalDays) * 100, 100)}%` 
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="habit-schedule">
                                    <div className="schedule-info">
                                        <i className="bi bi-calendar-event"></i>
                                        <span>Started: {format(new Date(habit.startDate), 'MMM d, yyyy')}</span>
                                    </div>
                                    <div className="habit-actions">
                                        <button 
                                            className="action-btn info-btn"
                                            onClick={() => handleViewHabitInfo(habit)}
                                            title="View Details"
                                        >
                                            <i className="bi bi-info-circle"></i>
                                        </button>
                                        <button 
                                            className="action-btn edit-btn"
                                            onClick={() => handleEditHabit(habit)}
                                            title="Edit Habit"
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button 
                                            className="action-btn delete-btn"
                                            onClick={() => handleDeleteHabit(habit._id, habit.title)}
                                            title="Delete Habit"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                        </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Modals */}
            {showEditHabitModal && selectedHabit && (
                <EditHabitModal
                habit={selectedHabit}
                 onClose={() => {
                    setShowEditHabitModal(false);
                    setSelectedHabit(null);
                }}/>
            )}
            {showHabitInfoModal && selectedHabit && (
                <HabitInfoModal
                habit={selectedHabit}
                 onClose={() => {
                    setShowHabitInfoModal(false);
                    setSelectedHabit(null);
                }}/>
            )}
        </div>
        
    );
}

export default AllHabitsComponent;