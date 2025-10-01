const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

// Management view
invCont.buildManagement = async function (req, res) {
  let nav = await utilities.getNav();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
  });
}

// Add classification view
invCont.buildAddClassification = async function (req, res) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    classification_name: ""
  });
}

// Add classification POST
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  const result = await invModel.addClassification(classification_name);
  if (result && result.rowCount > 0) {
    req.flash("notice", "Classification added successfully.");
    nav = await utilities.getNav();
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Failed to add classification.");
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name
    });
  }
}

// Add inventory view
invCont.buildAddInventory = async function (req, res) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add Inventory Item",
    nav,
    errors: null,
    classificationList,
    inv_make: "", inv_model: "", inv_year: "", inv_description: "", inv_price: "",
    inv_miles: "", inv_color: "", classification_id: "", inv_image: "", inv_thumbnail: ""
  });
}

// Add inventory POST
invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList(req.body.classification_id);
  const result = await invModel.addInventory(req.body);
  if (result && result.rowCount > 0) {
    req.flash("notice", "Inventory item added successfully.");
    nav = await utilities.getNav();
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Failed to add inventory item.");
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory Item",
      nav,
      errors: null,
      classificationList,
      ...req.body
    });
  }
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory detail view
 * ************************** */

invCont.buildDetailView = async function (req, res, next) {
  const inv_id = req.params.inv_id;
  const data = await invModel.getInventoryByInventoryId(inv_id);
  console.log("vehicle data:", data);
  const grid = await utilities.buildDetailView(data);
  let nav = await utilities.getNav();
  const make = data.inv_make;
  const model = data.inv_model;
  const year = data.inv_year;
  res.render("./inventory/detailInventory", {
    title: `${year} ${make} ${model}`,
    nav, 
    grid
  })
}

/* ***************************
 *  Build Error view
 * ************************** */

invCont.throwError = async (req, res) => {
  const error = new Error("Intentional 500 error testing")
  error.status = 500
  throw error
}

module.exports = invCont