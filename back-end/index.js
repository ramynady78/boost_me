const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const dbUrl = process.env.MONGO_URL;
mongoose.connect(dbUrl).then(() => {
    console.log("MongoDB server started");
});

// ========== Routers ==========
const userRouter = require('./router/user.router');
app.use("/api/users", userRouter);

const userSettingsRouter = require('./router/userSettings.router');
app.use("/api/user/setting", userSettingsRouter);

const taskRouter = require('./router/task.router');
app.use("/api/tasks", taskRouter);

const habitRouter = require('./router/habit.router');
app.use("/api/habits", habitRouter);

const pomodoroRouter = require('./router/pomodoro.router');
app.use("/api/pomodoro", pomodoroRouter);

// ========== Serve Frontend ==========
const frontendPath = path.join(__dirname, '../front-end/build');
app.use(express.static(frontendPath));

app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ========== Error Handler ==========
app.use((error, req, res, next) => {
    return res.status(error.statusCode || 500).json({
        status: error.statusText,
        message: error.message,
        code: error.statusCode,
        data: null
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
