const express = require('express');
const { verifyToken } = require('../middlewares/verifyToken');
const idValidation = require('../middlewares/idValidation');
const router = express.Router();

const taskControllers = require("../controllers/task.controllers");


router.route("/").get(verifyToken , taskControllers.getAllTasks);
router.route("/create").post(verifyToken,taskControllers.createNewTask);
router.route("/task_details/:taskId").get(verifyToken,idValidation,taskControllers.getSingleTask);
router.route("/update/:taskId").patch(verifyToken,idValidation, taskControllers.updateTask);
router.route("/delete/:taskId").delete(verifyToken,idValidation, taskControllers.deleteTask);
module.exports = router;