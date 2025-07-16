const express = require('express');
const { verifyToken } = require('../middlewares/verifyToken');
const router = express.Router();

const userSettingsControllers = require("../controllers/userSettings.controllers");


router.route("/").get(verifyToken , userSettingsControllers.getUserSettings);
router.route("/update").patch(verifyToken, userSettingsControllers.updateUserSettings);

module.exports = router;