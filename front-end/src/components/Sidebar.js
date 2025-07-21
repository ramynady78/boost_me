import { Link } from "react-router";

function Sidebar({ isOpen, onToggle }) {
  
  const toggleSidebar = () => {
    onToggle(!isOpen);
  };
  const isMobile = () => window.innerWidth <= 768;
  const handleMenuItemClick = () => {
    document.title = "BoostMe"
    if (isMobile()) {
      toggleSidebar();
    }
  };

  const menuItems = [
    { id: 'home', icon: 'bi-house', label: 'Home', color: '#10b981' , url:'/' },
    { id: 'todo', icon: 'bi-list-check', label: 'To Do List', color: '#8b5cf6', url:'/todo-list' },
    { id: 'habit', icon: 'bi-calendar-check', label: 'Habit Tracker', color: '#06b6d4' ,url:'/habit-tracker' },
    { id: 'pomodoro', icon: 'bi-stopwatch', label: 'Pomodoro Timer', color: '#f59e0b', url:'/pomodoro-timer' }
  ];

  return (
    <>
      {/* Mobile Toggle Button - يظهر فقط في الموبايل */}
      <button 
        className={`mobile-sidebar-toggle ${isOpen ? 'hide' : 'show'}`}
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      >
        <i className="bi bi-list"></i>
      </button>

      <div className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          {isOpen && <h3 className="sidebar-title">Menu</h3>}
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <i className={`bi ${isOpen ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
          </button>
        </div>

        <div className="sidebar-content">
          {menuItems.map(item => (
            <Link
              key={item.id}
              className="sidebar-item"
              style={{ '--item-color': item.color }}
              title={!isOpen ? item.label : ''}
              to={item.url}
              onClick={handleMenuItemClick}
            >
              <div className="item-icon">
                <i className={`bi ${item.icon}`}></i>
              </div>
              {isOpen && <span className="item-label">{item.label}</span>}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default Sidebar;