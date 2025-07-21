import React, { useState } from 'react';
import { useCreateTaskMutation } from '../RTK/slices/tasksApi';

function AddNewTask({ onCancel }) {
    const [formData, setFormData] = useState({
        taskTitle: '',
        taskDate: '',
        taskStatus: 'Not Started',
        taskDescription: ''
    });
    const [createTask, { isLoading }] = useCreateTaskMutation();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const sendData = async () => {
        try {
            const response = await createTask(formData).unwrap(); 
            if (response?.data?.newTask) onCancel();
        } catch (err) {
            const message = err?.data?.message;
            document.querySelector(".general.warning-message").textContent = message;
        }
    };

    const fieldsValidation = () => {
        let valid = true;
        document.querySelector(".title.warning-message").textContent = "";
        document.querySelector(".date.warning-message").textContent = "";
        
        if (formData.taskTitle.trim().length <= 1) {
            document.querySelector(".title.warning-message").textContent = "*Title is required*";
            valid = false;
        }
        if (formData.taskDate.length <= 1) {
            document.querySelector(".date.warning-message").textContent = "*Date is required*";
            valid = false;
        }
        return valid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fieldsValidation() && sendData();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="add-task-modal">
                {/* Modal Header */}
                <div className="modal-header">
                    <div className="modal-title-section">
                        <div className="modal-icon">
                            <i className="bi bi-list-check"></i>
                        </div>
                        <div className="modal-title-text">
                            <h2 className="modal-title">Add New Task</h2>
                            <p className="modal-subtitle">Create a new task to stay organized and productive</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onCancel}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Modal Body */}
                <form className="add-task-form" onSubmit={handleSubmit}>
                    <p className='general warning-message'></p>
                    <div className="form-grid">
                        {/* Task Title */}
                        <div className="input-group full-width">
                            <label htmlFor="add-title" className="input-label">
                                <i className="bi bi-pencil"></i>
                                Task Title<p className="title warning-message"></p>
                            </label>
                            <input 
                                type="text" 
                                id="add-title"
                                name="taskTitle"
                                value={formData.taskTitle}
                                className="form-input"
                                placeholder="Enter your task title..."
                                onChange={handleInputChange}
                                maxLength="100"
                            />
                        </div>

                        {/* Task Date */}
                        <div className="input-group">
                            <label htmlFor="add-date" className="input-label">
                                <i className="bi bi-calendar"></i>
                                Due Date<p className='date warning-message'></p>
                            </label>
                            <input 
                                type="date" 
                                id="add-date"
                                name="taskDate"
                                value={formData.taskDate}
                                className="form-input"
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        {/* Task Status */}
                        <div className="input-group">
                            <label htmlFor="add-status" className="input-label">
                                <i className="bi bi-flag"></i>
                                Status
                            </label>
                            <select 
                                id="add-status"
                                name="taskStatus"
                                value={formData.taskStatus}
                                className="form-select"
                                onChange={handleInputChange}
                            >
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>

                        {/* Task Description */}
                        <div className="input-group full-width">
                            <label htmlFor="add-description" className="input-label">
                                <i className="bi bi-text-paragraph"></i>
                                Description
                            </label>
                            <textarea 
                                id="add-description"
                                name="taskDescription"
                                value={formData.taskDescription}
                                className="form-textarea"
                                placeholder="Add task description (optional)..."
                                rows="4"
                                onChange={handleInputChange}
                                maxLength="500"
                            />
                            <div className="char-count">
                                {formData.taskDescription.length}/500 characters
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            <i className="bi bi-x-lg"></i>
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="btn-spinner"></div>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-plus-lg"></i>
                                    Add Task
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddNewTask;