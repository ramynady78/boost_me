import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function VerifyEmailPage() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    const pendingData = localStorage.getItem('pendingVerification');
    
    if (!pendingData) {
      navigate('/register');
      return;
    }

    const { email } = JSON.parse(pendingData);
    setUserEmail(email);
  }, [navigate]);

  // Timer للإعادة إرسال
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // التركيز على أول input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index, value) => {
    // السماح بالأرقام فقط
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // مسح الأخطاء عند الكتابة
    if (errors.otp) {
      setErrors({});
    }

    // الانتقال للـ input التالي
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace - الانتقال للـ input السابق
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Enter - إرسال OTP
    if (e.key === 'Enter') {
      handleVerifyOTP();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (pastedData.length === 4) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[3]?.focus();
    }
  };
  const otpString = otp.join('');
  const sendRequast = async() => {
    const api = `${process.env.REACT_APP_API_BASE_URL}/users/verfiy`;
    try {
      const response = await axios.post(api, {
        email: userEmail,
        otpCode: otpString
      });

      if (response.data.status === 'success') {
        // مسح بيانات التحقق
        localStorage.removeItem('pendingVerification');
        localStorage.setItem("token", response.data.data.token);
        navigate('/');
      }
    } catch (error) {
      console.log('Verification error:', error);
      
      if (error.response?.data?.message) {
        setErrors({ otp: error.response.data.message });
      } else {
        setErrors({ otp: 'Verification failed. Please try again.' });
      }
      
      // مسح OTP عند الخطأ
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  }
  const handleVerifyOTP =  () => {
    
    if (otpString.length !== 4) {
      setErrors({ otp: 'Please enter the complete 4-digit code' });
      return;
    }

    setIsLoading(true);
    setErrors({});
    sendRequast();
    
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setErrors({});

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/resendotp`, {
        email: userEmail
      });

      // إعادة تعيين Timer
      setTimer(60);
      setCanResend(false);
      
      // مسح OTP الحالي
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();

    } catch (error) {
      console.log('Resend error:', error);
      
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Failed to resend code. Please try again.' });
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToRegister = () => {
    localStorage.removeItem('pendingVerification');
    navigate('/register');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="verify-container">
      <div className="verify-wrapper fade-in">
        {/* Brand Section */}
        <div className="brand-section">
          <div className="brand-icon">
            <i className="bi bi-shield-check"></i>
          </div>
          <h1 className="brand-title">BoostMe</h1>
          <p className="brand-subtitle">Verify Your Email Address</p>
        </div>

        {/* Verification Info */}
        <div className="verify-info">
          <p className="verify-text">
            We've sent a 4-digit verification code to
          </p>
          <p className="email-display">{userEmail}</p>
          <p className="verify-subtext">
            Enter the 4-digit code below to verify your account
          </p>
        </div>

        {/* OTP Form */}
        <form className="verify-form" onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }}>
          {errors.general && (
            <div className="error-message general-error">
              <i className="bi bi-exclamation-triangle"></i>
              {errors.general}
            </div>
          )}

          {/* OTP Input */}
          <div className="otp-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength="1"
                className={`otp-input ${errors.otp ? 'error' : ''}`}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
              />
            ))}
          </div>

          {errors.otp && (
            <div className="error-text otp-error">
              <i className="bi bi-exclamation-circle"></i>
              {errors.otp}
            </div>
          )}

          {/* Verify Button */}
          <button 
            type="submit" 
            className={`verify-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || otp.join('').length !== 4}
          >
            {isLoading ? (
              <>
                <i className="bi bi-arrow-clockwise spinning"></i>
                Verifying...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle"></i>
                Verify Email
              </>
            )}
          </button>

          {/* Resend Section */}
          <div className="resend-section">
            {!canResend ? (
              <p className="timer-text">
                Resend code in <span className="timer">{formatTime(timer)}</span>
              </p>
            ) : (
              <button 
                type="button" 
                className={`resend-btn ${isResending ? 'loading' : ''}`}
                onClick={handleResendOTP}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <i className="bi bi-arrow-clockwise spinning"></i>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-clockwise"></i>
                    Resend Code
                  </>
                )}
              </button>
            )}
          </div>

          <div className="divider">
            <span>Need help?</span>
          </div>

          <button 
            type="button" 
            className="back-btn"
            onClick={handleBackToRegister}
          >
            <i className="bi bi-arrow-left"></i>
            Back to Registration
          </button>
        </form>

        {/* Footer */}
        <div className="verify-footer">
          <p>&copy; 2025 BoostMe. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;