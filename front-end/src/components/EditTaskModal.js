import { useState, useEffect } from 'react';
import { useUpdateTaskMutation } from '../RTK/slices/tasksApi';
import Swal from 'sweetalert2';

function EditTaskModal({ task, onClose }) {
    const [updateTask, { isLoading }] = useUpdateTaskMutation();
    
    const [formData, setFormData] = useState({
        taskTitle: '',
        taskDate: '',
        taskStatus: 'Not Started',
        taskDescription: ''
    });

    const [originalData, setOriginalData] = useState({});

    // Fill form with task data when modal opens
    useEffect(() => {
        if (task) {
            const initialData = {
                taskTitle: task.taskTitle || '',
                taskDate: task.taskDate ? new Date(task.taskDate).toISOString().split('T')[0] : '',
                taskStatus: task.taskStatus || 'Not Started',
                taskDescription: task.taskDescription || ''
            };
            setFormData(initialData);
            setOriginalData(initialData); // Store original data for comparison
        }
    }, [task]);

    // Check if form data has changed
    const hasChanges = () => {
        return (
            formData.taskTitle !== originalData.taskTitle ||
            formData.taskDate !== originalData.taskDate ||
            formData.taskStatus !== originalData.taskStatus ||
            formData.taskDescription !== originalData.taskDescription
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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

    const sendData = async () => {
        try {
            await updateTask({
                taskId: task._id,
                formData: {
                    taskTitle: formData.taskTitle.trim(),
                    taskDate: formData.taskDate,
                    taskStatus: formData.taskStatus,
                    taskDescription: formData.taskDescription.trim()
                }
            }).unwrap();

            Swal.fire({
                title: 'Success!',
                text: 'Task updated successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
            });

            onClose();
        } catch (err) {
            const message = err?.data?.message || 'Failed to update task. Please try again.';
            document.querySelector(".general.warning-message").textContent = message;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fieldsValidation() && sendData();
    };

    const handleClose = () => {
        if (hasChanges()) {
            Swal.fire({
                title: 'Unsaved Changes',
                text: 'You have unsaved changes. Are you sure you want to close without saving?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: '<i class="bi bi-x-circle"></i> Close Without Saving',
                cancelButtonText: '<i class="bi bi-arrow-left"></i> Continue Editing',
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
                    onClose();
                }
            });
        } else {
            onClose();
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="edit-modal">
                {/* Modal Header */}
                <div className="modal-header">
                    <div className="modal-title-section">
                        <div className="modal-icon">
                            <i className="bi bi-pencil-square"></i>
                        </div>
                        <div className="modal-title-text">
                            <h2 className="modal-title">Edit Task</h2>
                            <p className="modal-subtitle">Update your task details</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={handleClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Modal Body */}
                <form className="edit-model-form" onSubmit={handleSubmit}>
                    <p className='general warning-message'></p>
                    <div className="form-grid">
                        {/* Task Title */}
                        <div className="input-group full-width">
                            <label htmlFor="edit-title" className="input-label">
                                <i className="bi bi-pencil"></i>
                                Task Title<p className="title warning-message"></p>
                            </label>
                            <input
                                type="text"
                                id="edit-title"
                                name="taskTitle"
                                value={formData.taskTitle}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Enter task title"
                                maxLength="100"
                            />
                        </div>

                        {/* Task Date */}
                        <div className="input-group">
                            <label htmlFor="edit-date" className="input-label">
                                <i className="bi bi-calendar"></i>
                                Due Date<p className='date warning-message'></p>
                            </label>
                            <input
                                type="date"
                                id="edit-date"
                                name="taskDate"
                                value={formData.taskDate}
                                onChange={handleInputChange}
                                className="form-input"
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        {/* Task Status */}
                        <div className="input-group">
                            <label htmlFor="edit-status" className="input-label">
                                <i className="bi bi-flag"></i>
                                Status
                            </label>
                            <select
                                id="edit-status"
                                name="taskStatus"
                                value={formData.taskStatus}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>

                        {/* Task Description */}
                        <div className="input-group full-width">
                            <label htmlFor="edit-description" className="input-label">
                                <i className="bi bi-text-paragraph"></i>
                                Description
                            </label>
                            <textarea
                                id="edit-description"
                                name="taskDescription"
                                value={formData.taskDescription}
                                onChange={handleInputChange}
                                className="form-textarea"
                                placeholder="Enter task description (optional)"
                                rows="4"
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
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            <i className="bi bi-x-lg"></i>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn-primary ${!hasChanges() ? 'disabled' : ''}`}
                            disabled={isLoading || !hasChanges()}
                        >
                            {isLoading ? (
                                <>
                                    <div className="btn-spinner"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-plus-lg"></i>
                                    Update Task
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditTaskModal;