const express = require('express')
const router = new express.Router()
const cartController = require('../controllers/cartController')
const utilities = require('../utilities/')
const cartValidate = require('../utilities/cart-validation')

router.get('/', utilities.checkLogin, utilities.handleErrors(cartController.viewCart))
router.post('/add', utilities.checkLogin, cartValidate.addRules(), cartValidate.checkAdd, utilities.handleErrors(cartController.addToCart))
router.post('/update', utilities.checkLogin, cartValidate.updateRules(), cartValidate.checkUpdate, utilities.handleErrors(cartController.updateQuantity))
router.post('/remove', utilities.checkLogin, utilities.handleErrors(cartController.removeFromCart))

module.exports = router
