const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

// Management view
invCont.buildManagement = async function (req, res) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryByInventoryId(inv_id);
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,

    classification_id: itemData.classification_id
    });
  }

  /* ***************************
   *  Build delete confirmation view
   * ************************** */
  invCont.buildDeleteInventory = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryByInventoryId(inv_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    res.render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price
    });
  }

  /* ***************************
   *  Delete Inventory Data
   * ************************** */
  invCont.deleteInventory = async function (req, res, next) {
    const inv_id = parseInt(req.body.inv_id);
    const deleteResult = await invModel.deleteInventory(inv_id);
    if (deleteResult) {
      req.flash("notice", "The inventory item was successfully deleted.");
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Sorry, the delete failed.");
      res.redirect(`/inv/delete/${inv_id}`);
    }
  }

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
  }
}

module.exports = invCont