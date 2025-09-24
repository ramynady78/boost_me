import { useEffect, useState } from "react";
import { useGetTasksQuery } from "../RTK/slices/tasksApi";
import { useClearAllSessionsMutation, useCreatePomodoroMutation, useGetpomodorosQuery } from "../RTK/slices/pomodoroApi";
import Swal from "sweetalert2";

const AddPomodoroSessionModel = ({sessionType ,sessionTime , onSessionAdd ,isRunning}) => {
    const isLoggedIn = localStorage.getItem("token")?.trim();
    
    const [showAddSession, setShowAddSession]= useState(false);
    const [showTaskFromToDoList, setShowTaskFromToDoList]= useState(false);
    const [sessionName, setSessionName]= useState("")
    const [sessions, setSessions] = useState([])
    const [createPomodro] = useCreatePomodoroMutation(undefined, {
    skip: !isLoggedIn, 
    });
    
    const { data:pomodoroSessions } = useGetpomodorosQuery(undefined, {
    skip: !isLoggedIn, 
    });
    useEffect(() => {
        if(pomodoroSessions?.data?.allPomodoroSessions){
            setSessions(pomodoroSessions?.data?.allPomodoroSessions)
        }
    }, [pomodoroSessions]);

    const reverseSessions = [...sessions].reverse()

    const sendData = async () => {
        const sessionTimeMinutes = sessionTime / 60;
        const formData = {
            sessionName: sessionName,
            sessionType: sessionType,
            duration: sessionTimeMinutes,
            status: "inProgress",
        };
        try {
            onSessionAdd(formData);
            setShowAddSession(false);
        } catch (error) {
            const message = error?.data?.message || "Something went wrong";
            document.querySelector(".general.warning-message").textContent = message;
        }
    };
    const { data: inProgressTasks } = useGetTasksQuery({ status: "In Progress" });
    const { data: notStartedTasks} = useGetTasksQuery({ status: "Not Started" });

    const allTasks = [
    ...(inProgressTasks?.data?.tasks || []),
    ...(notStartedTasks?.data?.tasks || []),
    ];    
    const reverseTasks = [...allTasks].reverse(); 
    

    const TasksFromToDoList = () => {
        return (
            <div className="tasks-div">
                {
                    reverseTasks.map(task => (
                        <p key={task._id} className="task-title"
                        onClick={()=> setSessionName(task.taskTitle)}>{task.taskTitle}</p>
                    ))
                }
            </div>
        )
    }
    
    const [clearAllPomodoroSession] = useClearAllSessionsMutation();
    const clearAllSessions = async () =>{
        const result =await Swal.fire({
            title: 'Clear All Sessions?',
            text: 'Are you sure you want to delete all your Pomodoro session data? This action is irreversible.',
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
            await clearAllPomodoroSession().unwrap(); 
            Swal.fire({
                title: 'Deleted!',
                text: 'All Pomodoro sessions have been successfully deleted.',
                icon: 'success',
                timer: 1000,
                showConfirmButton: false,
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
            });
            } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Something went wrong while deleting the sessions.',
                icon: 'error',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
            });                 
            }
        }
    }
  
    const formatDate = (isoString) => {
        if (!isoString) return '-';
        const date = new Date(isoString);

        return date.toLocaleString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };
    const handleSessionType = (sessionType) => {
        const types = {
            focus: "Focus",
            short_break: "Short Break",
            long_break: "Long Break"
        };
        return types[sessionType] || "Focus";
    };

    const onSubmit = () => {
        sendData();
        setShowAddSession(false)
    }

  return (
    <div className="add-pomodoro-session-model">
        <div className="top-header">
        {!isRunning && (
            showAddSession ? (
                <div className="add-session">
                <div className="task-info">
                    <p className=".general.warning-message"></p>

                    <input
                    className="task-input task-title-input"
                    type="text"
                    placeholder="What are you working on?"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    />

                    <div className="options"> 
                    {allTasks.length > 0 &&
                    <button onClick={() => setShowTaskFromToDoList(!showTaskFromToDoList)}>
                        {
                        showTaskFromToDoList ? (
                            "These tasks are imported from the To Do List page"
                        ) : (
                            <>
                            <i className="bi bi-plus"></i>
                            <span>Import tasks from To Do List</span>
                            </>
                        )
                        }
                    </button>
                    }
                    </div>

                    {showTaskFromToDoList && <TasksFromToDoList />}
                </div>

                <div className="add-session-actions">
                    <button 
                    className="btn btn-cancle"
                    onClick={() => setShowAddSession(false)}
                    >
                    Cancel
                    </button>

                    <button 
                    type="submit"
                    className="btn btn-save"
                    onClick={onSubmit}
                    >
                    Save
                    </button>
                </div>
                </div>
            ) : (
                <button
                className="add-task-btn" 
                onClick={() => {
                    setShowAddSession(true);
                    setShowTaskFromToDoList(false);
                }}
                >
                <i className="bi bi-plus-circle"></i> Add Task
                </button>
            )
        )}

        </div>
        {
            sessions.length > 0 &&
            <>
            <div className="model-header">
            <   h3 className="title">Session Data</h3>
            </div>

            <div className="sessions-table">
            {/* table header  */}
            <table className="table table-striped responsive-table">
            <thead>
                <tr>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Time</th>
                <th scope="col">Type</th>
                <th scope="col">Started</th>
                <th scope="col">Stopped</th>
                </tr>
            </thead>
            <tbody>
                {reverseSessions.map((session , index) => (
                    <tr key={session._id}>
                    <th scope="row" data-label="#"> {sessions.length - index} </th>
                    <td data-label="Name">{session.sessionName}</td>
                    <td data-label="Time">{session.duration}</td>
                    <td data-label="Type">{handleSessionType(session.sessionType)}</td>
                    <td data-label="Started">{formatDate(session.startedAt) || "00:00"}</td>
                    <td data-label="Stopped">{formatDate(session.endedAt) || "-"}</td>
                    </tr>
                ))}
            </tbody>
            </table>
        
            <div className="clear-sessions-box">
                <button 
                className="clear-data-btn"
                onClick={clearAllSessions}>Clear Data</button>
            </div>
            
            </div>
            </>
        }
      
    </div>
  );
};

export default AddPomodoroSessionModel;
