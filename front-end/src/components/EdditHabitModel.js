import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useUpdateHabitMutation } from '../RTK/slices/habitApi';

function EditHabitModal({ habit, onClose }) {
    const [updateHabit, { isLoading }] = useUpdateHabitMutation();
    
     const [formData, setFormData] = useState({
        title: '',
        description: '',
        repeat: '',
        frequency: 1,
        startDate: '',
        goalDays: 1,
        reminderTime: '',
        category:''
    });

    const [originalData, setOriginalData] = useState({});

    // Fill form with task data when modal opens
    useEffect(() => {
        if (habit) {
            const initialData = {
                title: habit.title || "",
                description: habit.description || "",
                repeat: habit.repeat || "",
                frequency: habit.frequency || 1,
                startDate: habit.startDate ? new Date(habit.startDate).toISOString().split('T')[0] : '',
                goalDays: habit.goalDays || 1,
                reminderTime: habit.reminderTime || "00-00-0000",
                category:habit.category || "Productivity"
            };
            setFormData(initialData);
            setOriginalData(initialData); // Store original data for comparison
        }
    }, [habit]);

    // Check if form data has changed
    const hasChanges = () => {
        return (
            formData.title !== originalData.title ||
            formData.description !== originalData.description ||
            formData.repeat !== originalData.repeat ||
            formData.frequency !== originalData.frequency ||
            formData.startDate !== originalData.startDate ||
            formData.goalDays !== originalData.goalDays ||
            formData.reminderTime !== originalData.reminderTime ||
            formData.category !== originalData.category 
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
        
        document.querySelectorAll('.warning-message').forEach(el => el.textContent = "");
        
        if (formData.title.trim().length <= 1) {
            document.querySelector(".title.warning-message").textContent = "*Title is required*";
            valid = false;
        }
        
        if (formData.startDate.length <= 1) {
            document.querySelector(".startDate.warning-message").textContent = "*Start date is required*";
            valid = false;
        }
        const goal = parseInt(formData.goalDays);
        if (!goal || goal < 1) {
            document.querySelector(".goalDays.warning-message").textContent = "*Goal days must be at least 1*";
            valid = false;
        }
        
        return valid;
    };

    const sendData = async () => {
        try {
            await updateHabit({
                habitId: habit._id,
                formData
            }).unwrap();

            Swal.fire({
                title: 'Success!',
                text: 'Habit updated successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
            });

            onClose();
        } catch (err) {
            const message = err?.data?.message || 'Failed to update habit. Please try again.';
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
                            <h2 className="modal-title">Edit Habit</h2>
                            <p className="modal-subtitle">Update your habit details</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={handleClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Modal Body */}
                <form className="edit-model-form" onSubmit={handleSubmit}>
                    <p className="general warning-message"></p>
                    <div className="form-grid">
                        {/* Title */}
                        <div className="input-group full-width">
                        <label htmlFor="edit-title" className="input-label">
                            <i className="bi bi-pencil"></i>
                            Habit Title <p className="title warning-message"></p>
                        </label>
                        <input
                            type="text"
                            id="edit-title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Enter habit title"
                            maxLength="100"
                        />
                        </div>

                        {/* Start Date */}
                        <div className="input-group">
                        <label htmlFor="edit-date" className="input-label">
                            <i className="bi bi-calendar"></i>
                            Start Date <p className="startDate warning-message"></p>
                        </label>
                        <input
                            type="date"
                            id="edit-date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className="form-input"
                            min={
                                formData.startDate
                                ? new Date(formData.startDate).toISOString().split('T')[0]
                                : new Date().toISOString().split('T')[0]
                            }
                        />
                        </div>

                        {/* Repeat */}
                        <div className="input-group">
                        <label htmlFor="edit-repeat" className="input-label">
                            <i className="bi bi-arrow-repeat"></i>
                            Repeat
                        </label>
                        <select
                            id="edit-repeat"
                            name="repeat"
                            value={formData.repeat}
                            onChange={handleInputChange}
                            className="form-select"
                        >
                            <option value="">Select...</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                        </div>

                        {/* Frequency */}
                        <div className="input-group">
                        <label htmlFor="edit-frequency" className="input-label">
                            <i className="bi bi-123"></i>
                            Frequency
                        </label>
                        <input
                            type="number"
                            id="edit-frequency"
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleInputChange}
                            className="form-input"
                            min="1"
                            max="30"
                        />
                        </div>

                        {/* Goal Days */}
                        <div className="input-group">
                        <label htmlFor="edit-goal" className="input-label">
                            <i className="bi bi-bullseye"></i>
                            Goal Days <p className="goalDays warning-message"></p>
                        </label>
                        <input
                            type="number"
                            id="edit-goal"
                            name="goalDays"
                            value={formData.goalDays}
                            onChange={handleInputChange}
                            className="form-input"
                            min="1"
                            max="365"
                        />
                        </div>

                        {/* Reminder Time */}
                        <div className="input-group">
                        <label htmlFor="edit-reminder" className="input-label">
                            <i className="bi bi-alarm"></i>
                            Reminder Time
                        </label>
                        <input
                            type="time"
                            id="edit-reminder"
                            name="reminderTime"
                            value={formData.reminderTime}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                        </div>

                        {/* Category */}
                        <div className="input-group">
                        <label htmlFor="edit-category" className="input-label">
                            <i className="bi bi-tags"></i>
                            Category
                        </label>
                        <select
                            id="edit-category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="form-select"
                        >
                            <option value="Productivity">Productivity</option>
                            <option value="Health">Health</option>
                            <option value="Learning">Learning</option>
                            <option value="Fitness">Fitness</option>
                            <option value="Finance">Finance</option>
                            <option value="Custom">Custom</option>
                        </select>
                        </div>

                        {/* Description */}
                        <div className="input-group full-width">
                        <label htmlFor="edit-description" className="input-label">
                            <i className="bi bi-text-paragraph"></i>
                            Description
                        </label>
                        <textarea
                            id="edit-description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="form-textarea"
                            placeholder="Enter task description (optional)"
                            rows="4"
                            maxLength="500"
                        />
                        <div className="char-count">
                            {formData.description.length}/500 characters
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
                            <i className="bi bi-check-lg"></i>
                            Update Habit
                            </>
                        )}
                        </button>
                    </div>
                    </form>

                                </div>
        </div>
    );
}

export default EditHabitModal;