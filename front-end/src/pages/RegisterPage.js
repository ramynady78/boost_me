import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showVerifyOption, setShowVerifyOption] = useState(false); 
  const [pendingEmail, setPendingEmail] = useState(''); 
  const navigate = useNavigate();

  // Validation functions
  const validateForm = () => {
    const newErrors = {};
    
    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Username validation
    if (!formData.userName.trim()) {
      newErrors.userName = 'Username is required';
    } else if (formData.userName.length < 3) {
      newErrors.userName = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.userName)) {
      newErrors.userName = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(ru|com|org|edu|net)$/i;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (name === 'email' && showVerifyOption) {
      setShowVerifyOption(false);
      setPendingEmail('');
    }
  };

  const sendRequest = async () => {
    const api = `${process.env.REACT_APP_API_BASE_URL}/users/register`;
    
    try {
      setIsLoading(true);
      setErrors({});
      setShowVerifyOption(false);
      
      const response = await axios.post(api, formData);
      
      if (response.data.status === 'success') {
        localStorage.setItem('pendingVerification', JSON.stringify({
          email: formData.email
        }));
        
        navigate('/verify-email');
      }
    } catch (error) {
      console.log('Registration error:', error);
      
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        
       
        if (message.includes("already registered but not verified") || 
            message.includes("not verified") ||
            message.includes("pending verification")) {
          
          setErrors({ 
            email: message 
          });
          setShowVerifyOption(true);
          setPendingEmail(formData.email);
          
        } else if (message.includes("email already exists") || 
                   message.includes("Email already")) {
          setErrors({ 
            email: "This email is already registered. Please use a different email or sign in." 
          });
          
        } else if (message.includes("username") || message.includes("Username")) {
          setErrors({ userName: message });
          
        } else {
          setErrors({ general: message });
        }
      } else if (error.request) {
        setErrors({ general: 'Network error. Please check your connection.' });
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ دالة للانتقال لصفحة التحقق
  const handleGoToVerify = () => {
    localStorage.setItem('pendingVerification', JSON.stringify({
      email: pendingEmail
    }));
    navigate('/verify-email');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    sendRequest();
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="register-container">
      <div className="register-wrapper fade-in">
        {/* Brand Section */}
        <div className="brand-section">
          <div className="brand-icon">
            <i className="bi bi-person-plus"></i>
          </div>
          <h1 className="brand-title">BoostMe</h1>
          <p className="brand-subtitle">Create your account and start your journey</p>
        </div>

        {/* Register Form */}
        <form className="register-form" onSubmit={handleRegister}>
          {errors.general && (
            <div className="error-message general-error">
              <i className="bi bi-exclamation-triangle"></i>
              {errors.general}
            </div>
          )}

          {/*  رسالة خاصة للإيميل المسجل بس مش متفعل */}
          {showVerifyOption && (
            <div className="info-message verify-needed">
              <div className="info-content">
                <i className="bi bi-info-circle"></i>
                <div>
                  <p><strong>Account Found!</strong></p>
                  <p>This email is registered but not verified yet.</p>
                </div>
              </div>
              <button 
                type="button" 
                className="verify-now-btn"
                onClick={handleGoToVerify}
              >
                <i className="bi bi-shield-check"></i>
                Verify Now
              </button>
            </div>
          )}

          {/* Name Fields */}
          <div className="form-group half-width">
            <label htmlFor="firstName" className="form-label">
              <i className="bi bi-person"></i>
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className={`form-input ${errors.firstName ? 'error' : ''}`}
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={handleInputChange}
              autoFocus
            />
            {errors.firstName && <span className="warning-message">{errors.firstName}</span>}
          </div>

          <div className="form-group half-width">
            <label htmlFor="lastName" className="form-label">
              <i className="bi bi-person"></i>
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className={`form-input ${errors.lastName ? 'error' : ''}`}
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={handleInputChange}
            />
            {errors.lastName && <span className="warning-message">{errors.lastName}</span>}
          </div>

          {/* Username Field */}
          <div className="form-group">
            <label htmlFor="userName" className="form-label">
              <i className="bi bi-at"></i>
              Username
            </label>
            <input
              type="text"
              id="userName"
              name="userName"
              className={`form-input ${errors.userName ? 'error' : ''}`}
              placeholder="Choose a username"
              value={formData.userName}
              onChange={handleInputChange}
            />
            {errors.userName && <span className="warning-message">{errors.userName}</span>}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <i className="bi bi-envelope"></i>
              Email Address
            </label>
            <input
              type="text"
              id="email"
              name="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && <span className="warning-message">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <i className="bi bi-lock"></i>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
            />
            {errors.password && <span className="warning-message">{errors.password}</span>}
          </div>

          {/* Register Button */}
          <button 
            type="submit" 
            className={`register-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="bi bi-arrow-clockwise spinning"></i>
                Creating Account...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus"></i>
                Create Account
              </>
            )}
          </button>

          <div className="divider">
            <span>Already have an account?</span>
          </div>

          <button 
            type="button" 
            className="login-redirect-btn"
            onClick={handleLoginRedirect}
          >
            <i className="bi bi-box-arrow-in-right"></i>
            Sign In Instead
          </button>
        </form>

        {/* Footer */}
        <div className="register-footer">
          <p>&copy; 2025 BoostMe. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;