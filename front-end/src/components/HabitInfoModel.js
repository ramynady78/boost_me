// HabitInfoModal.jsx

import { useEffect, useRef, useState } from "react";


function HabitInfoModal({ habit, onClose }) {
    
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    const [filterStatus, setFilterStatus] = useState('all');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const statusDropdownRef = useRef(null);

    const filteredHabitHistorys = [...habit?.history].filter(h => {
    if (filterStatus === 'completed') return h.completed;
    if (filterStatus === 'not-completed') return !h.completed;
    return true;
    });
    useEffect(() => {
        function handleClickOutside(event) {
        if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
            setShowStatusDropdown(false);
        }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    function handleStatusFilterChange(value) {
        setFilterStatus(value);
        setShowStatusDropdown(false);
    }
    const filterHistoryOptions = [
        { value: 'all', label: 'All', icon: 'bi-list-ul' },
        { value: 'completed', label: 'Completed', icon: 'bi-check2-square' },
        { value: 'not-completed', label: 'Not Completed', icon: 'bi-x-square' },
    ];



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
                            <h2 className="modal-title">Habit Details</h2>
                            <p className="modal-subtitle">Complete information about your habit</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="model-info-content">
                    {/* Habit Title Section */}
                    <div className="info-section">
                        <div className="section-header">
                            <i className="bi bi-pencil"></i>
                            <h3>Habit Title</h3>
                        </div>
                        <div className="section-content">
                            <p className="title-display">{habit.title}</p>
                        </div>
                    </div>

                    {/* habit streak Section */}
                    <div className="info-section">
                        <div className="section-header">
                            <i className="bi bi-fire" style={{ color: 'var(--accent)'}}></i>
                            <h3>Streak</h3>
                        </div>
                        <div className="section-content">
                            <div className="streak-display">
                                {habit.streak || 0}
                            </div>
                        </div>
                    </div>

                    {/* Habit history Section */}
                    <div className="info-section history-section">
                        <div className="section-header">
                            <div className="title">
                                <i className="bi bi-clock-history"></i>
                                <h3>Habit History</h3>
                            </div>
                            <div className="custom-dropdown" ref={statusDropdownRef}>
                                <button 
                                    className="dropdown-trigger"
                                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                >
                                    <i className={filterHistoryOptions.find(opt => opt.value === filterStatus)?.icon}></i>
                                    <span>{filterHistoryOptions.find(opt => opt.value === filterStatus)?.label}</span>
                                    <i className={`bi bi-chevron-down ${showStatusDropdown ? 'rotate' : ''}`}></i>
                                </button>

                                {showStatusDropdown && (
                                    <div className="dropdown-menu">
                                    {filterHistoryOptions.map(option => (
                                        <button
                                        key={option.value}
                                        className={`dropdown-item ${filterStatus === option.value ? 'active' : ''}`}
                                        onClick={() => handleStatusFilterChange(option.value)}
                                        >
                                        <i className={option.icon}></i>
                                        <span>{option.label}</span>
                                        {filterStatus === option.value && <i className="bi bi-check ms-auto"></i>}
                                        </button>
                                    ))}
                                    </div>
                                )}
                            </div>
                         </div>
                        <div className="section-content">
                          {filteredHabitHistorys.sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((h, index) => (
                            <div
                                key={index}
                                className={`alert d-flex justify-content-between align-items-center 
                                    ${h.completed ? 'alert-success' : 'alert-danger'}`}
                                role="alert"
                            >
                                <div>
                                <i className="bi bi-calendar-check me-2"></i>
                                {new Date(h.date).toLocaleDateString("en-GB")}
                                </div>
                                <span className="fw-bold">
                                {h.completed ? 'Completed' : 'Not Completed'}
                                </span>
                            </div>
                            ))}

                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="info-section">
                        <div className="section-header">
                            <i className="bi bi-text-paragraph"></i>
                            <h3>Description</h3>
                        </div>
                        <div className="section-content">
                            {habit.description && habit.description.trim() ? (
                                <p className="description-display">{habit.description}</p>
                            ) : (
                                <p className="no-description">
                                    <i className="bi bi-file-text"></i>
                                    No description provided for this habit
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Task Metadata */}
                    <div className="task-metadata">
                        <div className="metadata-item">
                            <i className="bi bi-calendar-check"></i>
                            <div className="metadata-content">
                                <span className="metadata-label">Completed Days</span>
                                <span className="metadata-value">
                                    {habit.completedDays } / {habit.goalDays}
                                </span>
                            </div>
                        </div>
                        <div className="metadata-item">
                            <i className="bi bi-calendar-plus"></i>
                            <div className="metadata-content">
                                <span className="metadata-label">Start At</span>
                                <span className="metadata-value">
                                    {new Date(habit.startDate).toLocaleDateString()}
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

export default HabitInfoModal;