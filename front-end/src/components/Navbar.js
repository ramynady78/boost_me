import{ useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';


function Navbar() {
  const navigate = useNavigate();

  const [isTokenValid, setIsTokenValid] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('token')?.trim();
    if (!token) {
      setIsTokenValid(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; 
      if (decoded.exp < currentTime) {
        localStorage.removeItem('token');
        setIsTokenValid(false);
        Swal.fire({
          icon: 'info',
          title: 'Session expired',
          text: 'Your session has expired. Please login again.',
          confirmButtonText: 'OK',
        }).then(() => {
          navigate('/login');
        });
      } else {
        setIsTokenValid(true);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setIsTokenValid(false);
      navigate('/login');
    }
  }, [navigate]);
  const oldTheme = localStorage.getItem('theme');
  document.body.className = oldTheme;

  const [theme, setTheme] = useState(oldTheme || 'light');
  const [userDropdown, setUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);

  //check is user login
  const isUserLogin = localStorage.getItem("token")?.trim();
  let user = {
    name: 'user',
    avatar: '/proflie.png',
  };

  if (isTokenValid && isUserLogin){ 
    const decoded = jwtDecode(isUserLogin);
    user.name = `${decoded.firstName}  ${decoded.lastName}`;
  };
  

  
  const handleLogOut = () => {
    Swal.fire({
        title: 'Sign Out',
        text: 'Are you sure you want to sign out?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '<i class="bi bi-box-arrow-right"></i> Sign Out',
        cancelButtonText: 'Cancel',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title',
            confirmButton: 'custom-swal-logout',
            cancelButton: 'custom-swal-cancel'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('token');
              Swal.fire({
                title: 'Signed Out Successfully!',
                text: 'Thanks for using BootMe',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                customClass: {
                    popup: 'custom-swal-popup'
                }
            });
            
            navigate("/");
        }
    });
  };
  const userDropdownXml = () => {
    return isUserLogin && isTokenValid  ? (
      <div className="user-dropdown">
        <button 
        className="dropdown-item"
        onClick={handleLogOut}>
          <i className="bi bi-box-arrow-left"></i>
          Logout
        </button>
      </div>
    ) : (
      <div className="user-dropdown">
        <Link 
        className="dropdown-item"
        to={'/login'}>
          <i className="bi bi-box-arrow-right"></i>
          Login
        </Link>
      </div>
    );
  };
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
  };

  const handleUserDropdown = () => setUserDropdown(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="custom-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to={'/'}>Boost<span style={{color:"var(--accent)"}}>Me</span></Link>
        </div>

        <div className="navbar-controls">
          <div className="theme-switcher">
            <span className="theme-label">Light</span>
            <div className="switch-container">
              <input
                type="checkbox"
                id="theme-switch"
                className="theme-switch"
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />
              <label htmlFor="theme-switch" className="switch-label"></label>
            </div>
            <span className="theme-label">Dark</span>
          </div>

          <div className="user-section" ref={userDropdownRef}>
            <div className="user-info" onClick={handleUserDropdown}>
              <img src={user.avatar} alt="User" className="user-avatar" />
              <span className="user-name">{user.name}</span>
              <svg className={`dropdown-arrow ${userDropdown ? 'rotated' : ''}`} width="16" height="16" viewBox="0 0 16 16">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {userDropdown && userDropdownXml()}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;