// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
// Validation and sanitization
const regValidate = require('../utilities/account-validation')
const accValidate = require('../utilities/account-update-validation')

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build register view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post(
	'/register',
	regValidate.registationRules(),
	regValidate.checkRegData,
	utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Default account route
router.get(
  "/", utilities.checkLogin,
  utilities.handleErrors(accountController.buildManagement)
)

// Account management update view
router.get('/update/:account_id', utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateView))

// Process account info update
router.post('/update', accValidate.updateRules(), accValidate.checkUpdateData, utilities.handleErrors(accountController.updateAccount))

// Process password change
router.post('/update-password', accValidate.passwordRules(), accValidate.checkPasswordData, utilities.handleErrors(accountController.updatePassword))

// Logout
router.get('/logout', (req, res) => { return utilities.logout(req, res) })

module.exports = router
