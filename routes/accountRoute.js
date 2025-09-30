// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")

// Route to build login view

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build register view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Validation and sanitization
const regValidate = require('../utilities/account-validation')

// Process the registration data
router.post(
	'/register',
	regValidate.registationRules(),
	regValidate.checkRegData,
	utilities.handleErrors(accountController.registerAccount)
)

module.exports = router
