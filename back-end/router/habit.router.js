const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/verifyToken');
const idValidation = require('../middlewares/idValidation');
const habitControllers = require('../controllers/habit.controllers');


router.route('/').get(verifyToken, habitControllers.getAllHabits);
router.route('/create').post(verifyToken, habitControllers.createNewHabit);
router.route('/update/:habitId').patch(verifyToken,idValidation, habitControllers.updateHabit);
router.route('/habit_details/:habitId').get(verifyToken,idValidation, habitControllers.getSingleHabit);
router.route('/delete/:habitId').delete(verifyToken,idValidation, habitControllers.deleteHabit);


module.exports = router;