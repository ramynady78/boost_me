const express = require('express');
const userControllers = require("../controllers/user.controllers")
const router = express.Router()

router.route("/").get( userControllers.getAllUsers);
router.route("/register").post(userControllers.register);
router.route("/verfiy").post(userControllers.verfiy);
router.route("/resendotp").post(userControllers.resendOtp);
router.route("/login").post(userControllers.login);

module.exports = router;