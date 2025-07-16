// TaskInfoModal.jsx

function TaskInfoModal({ task, onClose }) {
    
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Done': return 'var(--success)';
            case 'In Progress': return 'var(--accent)';
            case 'Not Started': return 'var(--warning)';
            default: return 'var(--text-secondary)';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Done': return 'bi-check-circle-fill';
            case 'In Progress': return 'bi-clock-fill';
            case 'Not Started': return 'bi-pause-circle-fill';
            default: return 'bi-question-circle-fill';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        return date.toLocaleDateString('en-US', options);
    };

    const getDaysRemaining = (dateString) => {
        const today = new Date();
        const dueDate = new Date(dateString);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return { text: `${Math.abs(diffDays)} days overdue`, color: 'var(--danger)', icon: 'bi-exclamation-triangle-fill' };
        } else if (diffDays === 0) {
            return { text: 'Due today', color: 'var(--warning)', icon: 'bi-clock-fill' };
        } else if (diffDays === 1) {
            return { text: 'Due tomorrow', color: 'var(--accent)', icon: 'bi-calendar-check' };
        } else {
            return { text: `${diffDays} days remaining`, color: 'var(--success)', icon: 'bi-calendar-plus' };
        }
    };

    const daysInfo = getDaysRemaining(task.taskDate);

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="info-modal">
                {/* Modal Header */}
                <div className="modal-header">
                    <div className="modal-title-section">
                        <div className="modal-icon">
                            <i className="bi bi-info-circle"></i>
                        </div>
                        <div className="modal-title-text">
                            <h2 className="modal-title">Task Details</h2>
                            <p className="modal-subtitle">Complete information about your task</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="model-info-content">
                    {/* Task Title Section */}
                    <div className="info-section">
                        <div className="section-header">
                            <i className="bi bi-pencil"></i>
                            <h3>Task Title</h3>
                        </div>
                        <div className="section-content">
                            <p className="title-display">{task.taskTitle}</p>
                        </div>
                    </div>

                    {/* Task Status Section */}
                    <div className="info-section">
                        <div className="section-header">
                            <i className="bi bi-flag"></i>
                            <h3>Status</h3>
                        </div>
                        <div className="section-content">
                            <div className="status-badge" style={{ backgroundColor: getStatusColor(task.taskStatus) }}>
                                <i className={getStatusIcon(task.taskStatus)}></i>
                                <span>{task.taskStatus}</span>
                            </div>
                        </div>
                    </div>

                    {/* Task Date Section */}
                    <div className="info-section">
                        <div className="section-header">
                            <i className="bi bi-calendar"></i>
                            <h3>Due Date</h3>
                        </div>
                        <div className="section-content">
                            <div className="date-info">
                                <p className="formatted-date">{formatDate(task.taskDate)}</p>
                                <div className="days-remaining" style={{ color: daysInfo.color }}>
                                    <i className={daysInfo.icon}></i>
                                    <span>{daysInfo.text}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Task Description Section */}
                    <div className="info-section">
                        <div className="section-header">
                            <i className="bi bi-text-paragraph"></i>
                            <h3>Description</h3>
                        </div>
                        <div className="section-content">
                            {task.taskDescription && task.taskDescription.trim() ? (
                                <p className="description-display">{task.taskDescription}</p>
                            ) : (
                                <p className="no-description">
                                    <i className="bi bi-file-text"></i>
                                    No description provided for this task
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Task Metadata */}
                    <div className="task-metadata">
                        <div className="metadata-item">
                            <i className="bi bi-calendar-plus"></i>
                            <div className="metadata-content">
                                <span className="metadata-label">Created</span>
                                <span className="metadata-value">
                                    {new Date(task.createdAt || task.taskDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="metadata-item">
                            <i className="bi bi-clock-history"></i>
                            <div className="metadata-content">
                                <span className="metadata-label">Last Updated</span>
                                <span className="metadata-value">
                                    {new Date(task.updatedAt || task.taskDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                    <button className="btn-primary" onClick={onClose}>
                        <i className="bi bi-check-lg"></i>
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TaskInfoModal;