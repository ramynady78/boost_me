// AllTasksCom.jsx
import { useState, useMemo, useRef, useEffect } from 'react';
import {useDeleteTaskMutation, useGetTasksQuery, useUpdateTaskMutation } from '../RTK/slices/tasksApi';
import Swal from 'sweetalert2';
import EditTaskModal from './EditTaskModal';
import TaskInfoModal from './TaskInfoModal';

function AllTasksComponent() {
const [selectedTask, setSelectedTask] = useState(null);
const [showEditModal, setShowEditModal] = useState(false);
const [showInfoModal, setShowInfoModal] = useState(false);
const [filterStatus, setFilterStatus] = useState('All');
const [filterDate, setFilterDate] = useState('All');
const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');

// Dropdown states
//fliter
const [showStatusFliterDropdown, setShowStatusFliterDropdown] = useState(false);
const [showDateFliterDropdown, setShowDateFliterDropdown] = useState(false);
const statusFliterDropdownRef = useRef(null);
const dateFliterDropdownRef = useRef(null);

const [deleteTask] = useDeleteTaskMutation();
const [updateTask] = useUpdateTaskMutation();

// Build query parameters for API
const queryParams = useMemo(() => {
    const params = {};
    if (filterStatus !== 'All') {
        params.status = filterStatus;
    }
    if (dateFrom) {
        params.from = dateFrom;
    }
    if (dateTo) {
        params.to = dateTo;
    }
    return params;
}, [filterStatus, dateFrom, dateTo]);

const { data: allTasks, isLoading } = useGetTasksQuery(queryParams);
const tasks = allTasks?.data?.tasks || [];
const reverseTasks = [...tasks].reverse();

// Close dropdowns when clicking outside
useEffect(() => {
    const handleClickOutside = (event) => {
        if (statusFliterDropdownRef.current && !statusFliterDropdownRef.current.contains(event.target)) {
            setShowStatusFliterDropdown(false);
        }
        if (dateFliterDropdownRef.current && !dateFliterDropdownRef.current.contains(event.target)) {
            setShowDateFliterDropdown(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

// Status options
const statusOptions = [
    { value: 'All', label: 'All Status', icon: 'bi-list-ul' },
    { value: 'Not Started', label: 'Not Started', icon: 'bi-circle' },
    { value: 'In Progress', label: 'In Progress', icon: 'bi-arrow-clockwise' },
    { value: 'Done', label: 'Done', icon: 'bi-check-circle' }
];

// Date options
const dateOptions = [
    { value: 'All', label: 'All Dates', icon: 'bi-calendar' },
    { value: 'Today', label: 'Today', icon: 'bi-calendar-day' },
    { value: 'Yesterday', label: 'Yesterday', icon: 'bi-calendar-minus' },
    { value: 'Tomorrow', label: 'Tomorrow', icon: 'bi-calendar-plus' },
    { value: 'This Week', label: 'This Week', icon: 'bi-calendar-week' },
    { value: 'This Month', label: 'This Month', icon: 'bi-calendar-month' },
    { value: 'Custom', label: 'Custom Range', icon: 'bi-calendar-range' }
];

// Helper function to format date display
const formatDateDisplay = (dateString) => {
    const taskDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (taskDateOnly.getTime() === todayOnly.getTime()) {
        return 'Today';
    } else if (taskDateOnly.getTime() === yesterdayOnly.getTime()) {
        return 'Yesterday';
    } else if (taskDateOnly.getTime() === tomorrowOnly.getTime()) {
        return 'Tomorrow';
    } else {
        return taskDate.toLocaleDateString();
    }
};

// Handle date filter change
const handleDateFilterChange = (value) => {
    setFilterDate(value);
    setShowDateFliterDropdown(false);
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (value) {
        case 'Today':
            setDateFrom(todayStr);
            setDateTo(todayStr);
            break;
        case 'Yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            setDateFrom(yesterdayStr);
            setDateTo(yesterdayStr);
            break;
        case 'Tomorrow':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            setDateFrom(tomorrowStr);
            setDateTo(tomorrowStr);
            break;
        case 'This Week':
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            setDateFrom(startOfWeek.toISOString().split('T')[0]);
            setDateTo(endOfWeek.toISOString().split('T')[0]);
            break;
        case 'This Month':
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            setDateFrom(startOfMonth.toISOString().split('T')[0]);
            setDateTo(endOfMonth.toISOString().split('T')[0]);
            break;
        case 'Custom':
            break;
        default:
            setDateFrom('');
            setDateTo('');
            break;
    }
};

const handleStatusFilterChange = (value) => {
    setFilterStatus(value);
    setShowStatusFliterDropdown(false);
};

// Rest of your existing functions (handleDeleteTask, handleStatusChange, etc.)
const handleDeleteTask = async (taskId, taskTitle) => {
    const result = await Swal.fire({
        title: 'Delete Task?',
        text: `Are you sure you want to delete "${taskTitle}"?`,
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
            await deleteTask({taskId}).unwrap();
            Swal.fire({
                title: 'Deleted!',
                text: 'Task has been deleted successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
            });
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to delete task. Please try again.',
                icon: 'error',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
            });
        }
    }
};

const handleStatusChange = async (taskId, newStatus) => {
    try {
        await updateTask({ 
            taskId, 
            formData: { taskStatus: newStatus } 
        }).unwrap();
    } catch (error) {
        console.error('Failed to update task status:', error);
    }
};

const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
};

const handleViewInfo = (task) => {
    setSelectedTask(task);
    setShowInfoModal(true);
};

const getStatusColor = (status) => {
    switch (status) {
        case 'Done': return 'var(--success)';
        case 'In Progress': return 'var(--accent)';
        case 'Not Started': return 'var(--danger)';
        default: return 'var(--text-secondary)';
    }
};

if (isLoading) {
    return (
        <div className="tasks-loading">
            <div className="loading-spinner"></div>
            <p>Loading tasks...</p>
        </div>
    );
};

return (
    <div className="all-tasks-container">
        {/* Tasks Header */}
        <div className="tasks-header">
            <div className="tasks-title">
                <h2>All Tasks</h2>
                <span className="tasks-count">{tasks.length} tasks</span>
            </div>
            
            {/* Filter Controls */}
            <div className="tasks-filters">
                {/* Status Filter */}
                <div className="custom-dropdown" ref={statusFliterDropdownRef}>
                    <button 
                        className="dropdown-trigger"
                        onClick={() => setShowStatusFliterDropdown(!showStatusFliterDropdown)}
                    >
                        <i className={statusOptions.find(opt => opt.value === filterStatus)?.icon}></i>
                        <span>{statusOptions.find(opt => opt.value === filterStatus)?.label}</span>
                        <i className={`bi bi-chevron-down ${showStatusFliterDropdown ? 'rotate' : ''}`}></i>
                    </button>
                    
                    {showStatusFliterDropdown && (
                        <div className="dropdown-menu">
                            {statusOptions.map(option => (
                                <button
                                    key={option.value}
                                    className={`dropdown-item ${filterStatus === option.value ? 'active' : ''}`}
                                    onClick={() => handleStatusFilterChange(option.value)}
                                >
                                    <i className={option.icon}></i>
                                    <span>{option.label}</span>
                                    {filterStatus === option.value && <i className="bi bi-check"></i>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Date Filter */}
                <div className="custom-dropdown" ref={dateFliterDropdownRef}>
                    <button 
                        className="dropdown-trigger"
                        onClick={() => setShowDateFliterDropdown(!showDateFliterDropdown)}
                    >
                        <i className={dateOptions.find(opt => opt.value === filterDate)?.icon}></i>
                        <span>{dateOptions.find(opt => opt.value === filterDate)?.label}</span>
                        <i className={`bi bi-chevron-down ${showDateFliterDropdown ? 'rotate' : ''}`}></i>
                    </button>
                    
                    {showDateFliterDropdown && (
                        <div className="dropdown-menu">
                            {dateOptions.map(option => (
                                <button
                                    key={option.value}
                                    className={`dropdown-item ${filterDate === option.value ? 'active' : ''}`}
                                    onClick={() => handleDateFilterChange(option.value)}
                                >
                                    <i className={option.icon}></i>
                                    <span>{option.label}</span>
                                    {filterDate === option.value && <i className="bi bi-check"></i>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Custom Date Range */}
        {filterDate === 'Custom' && (
            <div className="custom-date-range">
                <div className="date-input-wrapper">
                    <label>From Date</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="date-input"
                    />
                </div>
                <div className="date-input-wrapper">
                    <label>To Date</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="date-input"
                    />
                </div>
            </div>
        )}

        {/* Tasks Grid */}
        {tasks.length === 0 ? (
            <div className="no-tasks">
                <div className="no-tasks-icon">
                    <i className="bi bi-clipboard-x"></i>
                </div>
                <h3>No Tasks Found</h3>
                <p>You have no tasks at the moment. Add a task to get started and stay productive!</p>
            </div>
        ) : (
            <div className="tasks-grid">
                {reverseTasks.map(task => (
                    <div key={task._id} className="task-card">
                        {/* Task Header */}
                        <div className="task-header">
                            <div className="task-priority" 
                                    style={{ backgroundColor: getStatusColor(task.taskStatus) }}>
                            </div>
                            <div className="task-actions">
                                <button 
                                    className="action-btn info-btn"
                                    onClick={() => handleViewInfo(task)}
                                    title="View Details"
                                >
                                    <i className="bi bi-info-circle"></i>
                                </button>
                                <button 
                                    className="action-btn edit-btn"
                                    onClick={() => handleEditTask(task)}
                                    title="Edit Task"
                                >
                                    <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                    className="action-btn delete-btn"
                                    onClick={() => handleDeleteTask(task._id, task.taskTitle)}
                                    title="Delete Task"
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>

                        {/* Task Content */}
                        <div className="task-content">
                            <h3 className="task-title">{task.taskTitle}</h3>
                            <p className="task-description">
                                {task.taskDescription?.length > 100 
                                    ? `${task.taskDescription.substring(0, 100)}...`
                                    : task.taskDescription || 'No description provided'
                                }
                            </p>
                        </div>

                        {/* Task Footer */}
                        <div className="task-footer">
                            <div className="task-meta">
                                <div className="task-date">
                                    <i className="bi bi-calendar"></i>
                                    <span>{formatDateDisplay(task.taskDate)}</span>
                                </div>
                            </div>
                            
                            {/* custom drop down */}
                             
                            <select 
                                className="status-select"
                                value={task.taskStatus}
                                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                style={{ borderColor: getStatusColor(task.taskStatus) }}
                            >
                                    <option value="Not Started">Not Started</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Modals */}
        {showEditModal && selectedTask && (
            <EditTaskModal
                task={selectedTask}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedTask(null);
                }}
            />
        )}

        {showInfoModal && selectedTask && (
            <TaskInfoModal 
                task={selectedTask}
                onClose={() => {
                    setShowInfoModal(false);
                    setSelectedTask(null);
                }}
            />
        )}
    </div>
);
}

export default AllTasksComponent;


