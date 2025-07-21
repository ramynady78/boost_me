import { Route, Routes } from "react-router";
import Homepage from "../pages/Home";
import ToDoListPage from "../pages/ToDoList";
import HabitTrackerPage from "../pages/HabitTracker";
import PomodoroTimerPage from "../pages/PomodoroTimer";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar"
import Footer from "./Footer";

function MainLayout({ sidebarOpen, handleSidebarToggle }) {
  return (
    <>
      <Navbar />
      <div className="main-layout">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={handleSidebarToggle}
        />

        {/* Main Content Area */}
        <main className={`main-content ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
          <div className="content-wrapper">
            {/* Pages Routes */}
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/todo-list" element={<ToDoListPage />} />
              <Route path="/habit-tracker" element={<HabitTrackerPage />} />
              <Route path="/pomodoro-timer" element={<PomodoroTimerPage />} />
            </Routes>
          </div>
        </main>
      </div>
      <Footer/>
      {/* Mobile Overlay */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div
          className="mobile-overlay"
          onClick={() => handleSidebarToggle(false)}
        />
      )}
    </>
  );
}
export default MainLayout;