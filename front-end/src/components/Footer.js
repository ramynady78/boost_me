import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer bg-dark text-light py-5">
      <div className="container">
        <div className="row g-4">
          {/* Brand Section */}
          <div className="col-12 col-md-4">
            <h3 className="h4 fw-bold text-white mb-3">BoostMe</h3>
            <p className="text-secondary">
              Organize your day, stay focused, and achieve your goals with BoostMe's intuitive productivity tools.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="col-12 col-md-4">
            <h4 className="h5 fw-semibold text-white mb-3">Quick Links</h4>
            <div className="d-flex flex-column">
              <Link to="/" className="footer-links text-light mb-2">
                Home
              </Link>
              <Link to="/todo-list" className="footer-links text-light mb-2">
                To Do List
              </Link>
              <Link to="/habit-tracker" className="footer-links text-light mb-2">
                Habit Tracker
              </Link>
              <Link to="/pomodoro-timer" className="footer-links text-light mb-2">
                Pomodoro Tech
              </Link>
            </div>
          </div>

          {/* Social Media & Developer Credit */}
          <div className="col-12 col-md-4">
            <h4 className="h5 fw-semibold text-white mb-3">Connect With Us</h4>
            <div className="social-icons d-flex gap-3 mb-3">
              <a
                className="linkedin"
                aria-label="LinkedIn"
                href="https://www.linkedin.com/in/ramy-nady-1a766625a/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-linkedin fa-lg"></i>
              </a>
              <a
                className="git-hub"
                aria-label="GitHub"
                href="https://github.com/ramynady78"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-github fa-lg"></i>
              </a>
              <a
                className="telegram"
                aria-label="Telegram"
                href="https://t.me/ramynady8"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-telegram-plane fa-lg"></i>
              </a>
            </div>
            <p className="developer-credit text-secondary">
              Developed by{" "}
              <a
                href="https://t.me/ramynady8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary"
              >
                Ramy Nady
              </a>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-top border-secondary text-center">
          <p className="copyright text-secondary mb-0">
            © 2025 BoostMe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;