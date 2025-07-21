import  { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage'; 
import MainLayout from './components/MainLayout';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  // Handle sidebar state changes
  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = savedTheme;
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
      <div className="App">
        <Routes>
          {/* مسار صفحة تسجيل الدخول */}
          <Route path="/login" element={<LoginPage />} />
          {/* to create anew account */}
          <Route path="/register" element={<RegisterPage />} />
          {/* verify email */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* باقي المسارات التي تتضمن Navbar و Sidebar */}
          <Route path="/*" element={<MainLayout sidebarOpen={sidebarOpen} handleSidebarToggle={handleSidebarToggle} />} />
        </Routes>
      </div>
  );
}


export default App;