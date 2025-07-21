import { useEffect, useState } from "react";
import AddNewTask from "../components/AddTaskModel";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router";
import { useGetTasksQuery } from "../RTK/slices/tasksApi";
import AllTasksComponent from "../components/AllTasksComponent";
function ToDoListPage(){

    const [ShowAddTask , setShowAddTask] = useState(false);
    const [tasks , SetTasks] = useState([]);
    const [completedTasks , setCompletedTasks] = useState([]);
    const [inProgressTasks , setInProgressTasks] = useState([]);
    
    const navigate = useNavigate();

    

    const isLoggedIn = localStorage.getItem("token")?.trim();
    const {data: allTasks} = useGetTasksQuery(undefined, { skip: !isLoggedIn });

    useEffect(() => {
            if (allTasks?.data.tasks) {
                SetTasks(allTasks?.data.tasks);
                setCompletedTasks(allTasks?.data.tasks.filter(task => task.taskStatus === "Done"))
                setInProgressTasks(allTasks?.data.tasks.filter(task => task.taskStatus === "In Progress"))
            }
    }, [allTasks]);



   const handleShowAddTask = () => {
    if(isLoggedIn) {
        setShowAddTask(true);
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
        <div className="container todo-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="page-icon">
                        <i className="bi bi-list-check"></i>
                    </div>
                    <div className="header-text">
                        <h1 className="page-title">Task Manager</h1>
                        <p className="page-subtitle">Organize and track your daily tasks efficiently</p>
                    </div>
                </div>
            </div>

            {/* Tasks Statistics */}
            <div className="tasks-statistics">
                <div className="stats-container">
                    <div className="stat-card total-tasks">
                        <div className="stat-icon">
                            <i className="bi bi-clipboard-data"></i>
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-title">Total Tasks</h3>
                            <p className="stat-number">{tasks.length ||  0 }</p>
                        </div>
                    </div>

                    <div className="stat-card completed-tasks">
                        <div className="stat-icon">
                            <i className="bi bi-check-circle"></i>
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-title">Completed</h3>
                            <p className="stat-number">{completedTasks.length || 0}</p>
                        </div>
                    </div>

                    <div className="stat-card pending-tasks">
                        <div className="stat-icon">
                            <i className="bi bi-clock"></i>
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-title">In Progress</h3>
                            <p className="stat-number">{inProgressTasks.length || 0}</p>
                        </div>
                    </div>

                </div>

                <button className="add-task-btn"
                onClick={handleShowAddTask}>
                    <i className="bi bi-plus-lg"></i>
                    <span>Add New Task</span>
                </button>
            </div>
            {ShowAddTask && <AddNewTask onCancel={() => setShowAddTask(false)} />}
            {isLoggedIn && <AllTasksComponent/>}
        </div>
    );
};

export default ToDoListPage;