const { body, validationResult } = require('express-validator')
const validate = {}

validate.addRules = () => [
  body('car_id').notEmpty().isInt().withMessage('Invalid car id.'),
  body('quantity').notEmpty().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
]

validate.updateRules = () => [
  body('car_id').notEmpty().isInt().withMessage('Invalid car id.'),
  body('quantity').notEmpty().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
]

validate.checkAdd = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash('notice', errors.array().map(e => e.msg).join(' '))
    return res.redirect('back')
  }
  next()
}

validate.checkUpdate = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash('notice', errors.array().map(e => e.msg).join(' '))
    return res.redirect('back')
  }
  next()
}

module.exports = validate
