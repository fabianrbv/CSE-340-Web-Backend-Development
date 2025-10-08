const utilities = require('.')
const { body, validationResult } = require('express-validator')
const accountModel = require('../models/account-model')
const validate = {}

validate.updateRules = () => {
  return [
    body('account_firstname').trim().escape().isLength({ min: 1 }).withMessage('Please provide a first name.'),
    body('account_lastname').trim().escape().isLength({ min: 1 }).withMessage('Please provide a last name.'),
    body('account_email').trim().isEmail().normalizeEmail().withMessage('A valid email is required.').custom(async (email, { req }) => {
      // if the email exists in DB, ensure it belongs to this account
      const existing = await accountModel.getAccountByEmailPublic(email)
      if (existing && parseInt(req.body.account_id) !== existing.account_id) {
        throw new Error('Email exists. Use a different email.')
      }
    })
  ]
}

validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render('account/update', {
      errors,
      title: 'Update Account',
      nav,
      account_firstname, account_lastname, account_email, account_id
    })
    return
  }
  next()
}

validate.passwordRules = () => {
  return [
    body('account_password').trim().isStrongPassword({ minLength: 12, minLowercase:1, minUppercase:1, minNumbers:1, minSymbols:1 }).withMessage('Password does not meet requirements.')
  ]
}

validate.checkPasswordData = async (req, res, next) => {
  const { account_id } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render('account/update', {
      errors,
      title: 'Update Account',
      nav,
      account_id
    })
    return
  }
  next()
}

module.exports = validate
