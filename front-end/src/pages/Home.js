import { Link } from 'react-router'
function Homepage() {

  const features = [
    {
      title: 'To Do List Manager',
      description: 'Organize your daily tasks efficiently with our intuitive task management system.',
      icon: 'bi-list-check',
      color: '#8b5cf6',
      url:'todo-list'
    },
    {
      title: 'Habit Tracker',
      description: 'Build and maintain healthy habits with our comprehensive tracking system.',
      icon: 'bi-calendar-check',
      color: '#06b6d4',
      url:'/habit-tracker'
    },
    {
      title: 'Pomodoro Timer',
      description: 'Boost your productivity with the proven Pomodoro technique for focused work sessions.',
      icon: 'bi-stopwatch',
      color: '#f59e0b',
      url:'/pomodoro-timer' 
    }
  ];

  return (
    <div className="homepage">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="brand-highlight">BoostMe</span>
          </h1>
          <p className="hero-subtitle">
            Discipline is the bridge between goals and accomplishment
          </p>
          <p className="hero-description">
           « The future depends on what you do today »
          </p>
        </div>
      </div>

      <div className="features-section">
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card" style={{ '--card-color': feature.color }}>
              <div className="feature-icon">
                <i className={`bi ${feature.icon}`}></i>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <Link 
              className="feature-button"
              to={feature.url}>Get Started</Link>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <h3 className="stat-number">1000+</h3>
            <p className="stat-label">Tasks Completed</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">500+</h3>
            <p className="stat-label">Habits Tracked</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">2000+</h3>
            <p className="stat-label">Pomodoro Sessions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;