import { useState } from 'react';
import { useCreateHabitMutation } from '../RTK/slices/habitApi';

function AddNewHabit({ onCancel }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        repeat: 'daily',
        frequency: 1,
        startDate: '',
        goalDays: 1,
        reminderTime: '',
        category:'Productivity'
    });
    
    const [createHabit, { isLoading }] = useCreateHabitMutation();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const sendData = async () => {
        try {
            const response = await createHabit(formData).unwrap(); 
            if (response?.data?.newHabit) onCancel();

        } catch (err) {
            const message = err?.data?.message || "Failed to create habit";
            document.querySelector(".general.warning-message").textContent = message;
        }
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
            <div className="add-habit-modal">
                {/* Modal Header */}
                <div className="modal-header">
                    <div className="modal-title-section">
                        <div className="modal-icon">
                            <i className="bi bi-calendar-check"></i>
                        </div>
                        <div className="modal-title-text">
                            <h2 className="modal-title">Add New Habit</h2>
                            <p className="modal-subtitle">Create a new habit to build consistency</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onCancel}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Modal Body */}
                <form className="add-habit-form" onSubmit={handleSubmit}>
                    <p className='general warning-message'></p>
                    
                    <div className="form-grid">
                        {/* Habit Title */}
                        <div className="input-group full-width">
                            <label htmlFor="add-title" className="input-label">
                                <i className="bi bi-pencil"></i>
                                Habit Title<p className="title warning-message"></p>
                            </label>
                            <input 
                                type="text" 
                                id="add-title"
                                name="title"
                                value={formData.title}
                                className="form-input"
                                placeholder="Enter your habit title..."
                                onChange={handleInputChange}
                                maxLength="100"
                            />
                        </div>

                        {/* Start Date */}
                        <div className="input-group">
                            <label htmlFor="add-startDate" className="input-label">
                                <i className="bi bi-calendar"></i>
                                Start Date<p className='startDate warning-message'></p>
                            </label>
                            <input 
                                type="date" 
                                id="add-startDate"
                                name="startDate"
                                value={formData.startDate}
                                className="form-input"
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        {/* Goal Days */}
                        <div className="input-group">
                            <label htmlFor="add-goalDays" className="input-label">
                                <i className="bi bi-bullseye"></i>
                                Goal Days<p className='goalDays warning-message'></p>
                            </label>
                            <input 
                                type="number" 
                                id="add-goalDays"
                                name="goalDays"
                                value={formData.goalDays}
                                className="form-input"
                                placeholder="e.g., 30"
                                onChange={handleInputChange}
                                min="1"
                                max="365"
                            />
                        </div>

                        {/* Repeat */}
                        <div className="input-group">
                            <label htmlFor="add-repeat" className="input-label">
                                <i className="bi bi-arrow-repeat"></i>
                                Repeat
                            </label>
                            <select 
                                id="add-repeat"
                                name="repeat"
                                value={formData.repeat}
                                className="form-select"
                                onChange={handleInputChange}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        {/* Repeat */}
                        <div className="input-group">
                            <label htmlFor="add-category" className="input-label">
                                <i className="bi bi-collection"></i>
                                Category
                            </label>
                            <select 
                                id="add-category"
                                name="category"
                                value={formData.category}
                                className="form-select"
                                onChange={handleInputChange}
                            >
                               {['Health','Productivity','Learning',
                               'Mindfulness','Social','Creative','Other'].map(opt => 
                                (<option key={opt} value={opt}>{opt}</option>)
                               )}
                            </select>
                        </div>

                        {/* Frequency */}
                        <div className="input-group">
                            <label htmlFor="add-frequency" className="input-label">
                                <i className="bi bi-123"></i>
                                Frequency
                            </label>
                            <input 
                                type="number" 
                                id="add-frequency"
                                name="frequency"
                                value={formData.frequency}
                                className="form-input"
                                onChange={handleInputChange}
                                min="1"
                                max="10"
                            />
                        </div>

                        {/* Reminder Time */}
                        {/* <div className="input-group">
                            <label htmlFor="add-reminderTime" className="input-label">
                                <i className="bi bi-alarm"></i>
                                Reminder Time
                            </label>
                            <input 
                                type="time" 
                                id="add-reminderTime"
                                name="reminderTime"
                                value={formData.reminderTime}
                                className="form-input"
                                onChange={handleInputChange}
                            />
                        </div> */}

                        {/* Description */}
                        <div className="input-group full-width">
                            <label htmlFor="add-description" className="input-label">
                                <i className="bi bi-text-paragraph"></i>
                                Description
                            </label>
                            <textarea 
                                id="add-description"
                                name="description"
                                value={formData.description}
                                className="form-textarea"
                                placeholder="Add habit description (optional)..."
                                rows="4"
                                onChange={handleInputChange}
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
                                    Add Habit
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddNewHabit;