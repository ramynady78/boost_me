# Productivity Hub

A comprehensive productivity web application that helps users manage their tasks, track habits, and stay focused using the Pomodoro technique.

## Features

### 🔐 Authentication System
- User registration and login
- Email verification with random code
- JWT-based authentication
- Password encryption with bcrypt

### ✅ Todo List
- Create tasks with title, due date, status, and description
- Task status options: Done, In Progress, Not Started
- Edit, delete, and view task details
- Filter tasks by status and date
- Responsive task management interface

### 📈 Habit Tracker
- Weekly calendar view with navigation (previous/next week)
- Add habits with:
  - Title and description
  - Start date and goal days
  - Frequency settings (daily, weekly, monthly)
  - Repeat patterns
- Edit, delete, and view habit details
- Streak calculation and progress tracking
- Progress bar showing completion percentage
- Custom streak calculation for each habit
- Filter habits by various criteria
- Habits automatically hide after goal completion

### 🍅 Pomodoro Timer
- Three session types: Focus, Short Break, Long Break
- Customizable default time settings for each session
- Audio notifications and alarms
- Task integration - link sessions to todo list items
- Session history with detailed information
- Work on tasks directly from todo list (In Progress/Not Started)
- Quote Banner shows random quotes 

## Technologies Used

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **Bootstrap** - CSS framework
- **CSS** - Custom styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Clone the Repository
```bash
git clone https://github.com/ramynady78/boost_me.git
cd BoostMe
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with the following variables:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/productivity-hub
# JWT_SECRET=your_jwt_secret_key
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_email_password

# Start the backend server
npm start
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
productivity-hub/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   └── server.js
└── README.md
```

## Usage

1. **Register/Login**: Create an account or log in with existing credentials
2. **Email Verification**: Verify your email using the code sent to your inbox
3. **Dashboard**: Access the main dashboard with navigation to all features
4. **Todo Management**: Add, edit, and track your daily tasks
5. **Habit Tracking**: Set up habits and monitor your progress weekly
6. **Pomodoro Sessions**: Start focused work sessions with break intervals

## API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/verify` - Email verification
- `POST /api/users/resendotp` - Resend Otp

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/task_details/:id` - Get single task
- `POST /api/tasks/create` - Create new task
- `PUT /api/tasks/update/:id` - Update task
- `DELETE /api/tasks/delete/:id` - Delete task

### Habits
- `GET /api/habits` - Get all habits
- `GET /api/habits/habit_details/:id` - Get single habit
- `POST /api/habits/create` - Create new habit
- `PUT /api/habits/update/:id` - Update habit
- `DELETE /api/habits/delete/:id` - Delete habit

### Pomodoro
- `GET api/pomodoro` - Get sessions history
- `POST api/pomodoro/create` - Save session
- `POST api/pomodoro/update/:id` - Update session
- `POST api/pomodoro/clear-all-sessions` - Clear all sessions
- `GET /api/user/setting` - Get user settings
- `PUT /api/user/setting/update` - Update settings

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Happy Productivity!** 🚀