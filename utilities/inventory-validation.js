const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

validate.rules = () => [
  body("inv_make").trim().escape().notEmpty().isLength({ min: 1 }).withMessage("Make is required."),
  body("inv_model").trim().escape().notEmpty().isLength({ min: 1 }).withMessage("Model is required."),
  body("inv_year").notEmpty().isInt({ min: 1900, max: 2099 }).withMessage("Year must be between 1900 and 2099."),
  body("inv_description").trim().escape().notEmpty().withMessage("Description is required."),
  body("inv_price").notEmpty().isFloat({ min: 0 }).withMessage("Price must be a positive number."),
  body("inv_miles").notEmpty().isInt({ min: 0 }).withMessage("Miles must be a positive integer."),
  body("inv_color").trim().escape().notEmpty().withMessage("Color is required."),
  body("classification_id").notEmpty().isInt().withMessage("Classification is required."),
  body("inv_image").trim().notEmpty().withMessage("Image path is required."),
  body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
]

// checkInventoryData
validate.check = async (req, res, next) => {
  const {
    inv_make, inv_model, inv_year, inv_description, inv_price,
    inv_miles, inv_color, classification_id, inv_image, inv_thumbnail
  } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory Item",
      nav,
      classificationList,
      inv_make, inv_model, inv_year, inv_description, inv_price,
      inv_miles, inv_color, classification_id, inv_image, inv_thumbnail
    })
    return
  }
  next()
}

// checkUpdateData: Middleware for update inventory validation, redirects errors to edit view
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
    inv_make, inv_model, inv_year, inv_description, inv_price,
    inv_miles, inv_color, classification_id, inv_image, inv_thumbnail
  } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      inv_id,
      inv_make, inv_model, inv_year, inv_description, inv_price,
      inv_miles, inv_color, classification_id, inv_image, inv_thumbnail
    })
    return
  }
  next()
}

module.exports = validate