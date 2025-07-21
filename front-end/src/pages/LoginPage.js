import axios from 'axios';
import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(ru|com|org|edu|net)$/i;
  const passwordRegex = /^.{8,}$/;

  
  const fildsVaildtion = () =>{
    const emailWerring = document.querySelector(".email.warning-message")
    const passwordWerring = document.querySelector(".password.warning-message")
    let result = true;
    emailWerring.textContent = "";
    passwordWerring.textContent = "";
    if(!emailRegex.test(email)){
      emailWerring.textContent = "*Please enter a valid email address*";
      result = false
    }
    if(!email.trim()){
      emailWerring.textContent = "*Email is required*";
      result = false
    }
    if(!passwordRegex.test(password)){
      passwordWerring.textContent = "*Please enter a valid password*";
      result = false
    }
    return result;
  }

  const sendRequast = async() => {
    const api  = `${process.env.REACT_APP_API_BASE_URL}/users/login`;

     try {
        const response = await axios.post(api,{
        email,
        password
       }).catch(error => {
        const errorMessage = document.querySelector(".error.warning-message");
        errorMessage.textContent = `* ${error.response.data.message}`;
       })
      if(response.data) {
        const token = response.data.data.token;
        localStorage.setItem('token', token);
        navigate('/');
      }
  
    } catch (error) {
      console.error('Login failed:', error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogin = (e) => {
    e.preventDefault();
    if(fildsVaildtion()){
        sendRequast();
        setIsLoading(true);
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <div className="login-wrapper fade-in">
        {/* Logo/Brand Section */}
        <div className="brand-section">
          <div className="brand-icon">
            <i className="bi bi-person-check"></i>
          </div>
          <h1 className="brand-title">BoostMe</h1>
          <p className="brand-subtitle">Welcome back! Please sign in to your account</p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <i className="bi bi-envelope"></i>
              Email Address <p className='email warning-message'></p>
            </label>
            <input
              type="text"
              id="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <i className="bi bi-lock"></i>
              Password <p className='password warning-message'></p>
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <p className='error warning-message'></p>
          <button 
            type="submit" 
            className={`login-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="bi bi-arrow-clockwise spinning"></i>
                Signing in...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                Sign In
              </>
            )}
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <button 
            type="button" 
            className="register-btn"
            onClick={handleRegister}
          >
            <i className="bi bi-person-plus"></i>
            Create New Account
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>&copy; 2025 BoostMe. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;