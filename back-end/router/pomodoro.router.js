const express = require('express');
const { verifyToken } = require('../middlewares/verifyToken');
const idValidation = require('../middlewares/idValidation');
const router = express.Router();

const pomodoroControllers = require('../controllers/pomodoro.controllers')


router.route("/").get(verifyToken , pomodoroControllers.getAllPomodoroSessions );
router.route("/create").post(verifyToken, pomodoroControllers.createNewPomodoroSession);
router.route("/clear-all-sessions").delete(verifyToken, pomodoroControllers.clearAllPomodoroSessions);
router.route("/session_details/:sessionId").get(verifyToken, idValidation, pomodoroControllers.getSinglePomodoroSession);
router.route("/update/:sessionId").patch(verifyToken, idValidation, pomodoroControllers.updatePomodoroSession);
router.route("/delete/:sessionId").delete(verifyToken, idValidation, pomodoroControllers.deletePomodoroSession);

module.exports = router;