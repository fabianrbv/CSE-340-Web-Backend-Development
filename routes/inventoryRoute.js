// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const classificationValidate = require('../utilities/classification-validation')
const inventoryValidate = require('../utilities/inventory-validation')
// Route to build inventory by classification view
// router.get("/type/:classificationId", invController.buildByClassificationId);

router.get("/detail/:inv_id", utilities.handleErrors(invController.buildDetailView));
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
// Management view
router.get("/", utilities.handleErrors(invController.buildManagement));

// Add classification (admin only)
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification));
router.post("/add-classification", utilities.checkAccountType, classificationValidate.rules(), classificationValidate.check, utilities.handleErrors(invController.addClassification));

// Add inventory (admin only)
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory));
router.post("/add-inventory", utilities.checkAccountType, inventoryValidate.rules(), inventoryValidate.check, utilities.handleErrors(invController.addInventory));

// Get inventory as JSON for management view
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Edit inventory item view (admin only)
router.get("/edit/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.buildEditInventory));

// Delete inventory item view (admin only)
router.get(
	"/delete/:inv_id",
	utilities.checkAccountType,
	utilities.handleErrors(invController.buildDeleteInventory)
);

// Delete inventory item POST (admin only)
router.post(
	"/delete",
	utilities.checkAccountType,
	utilities.handleErrors(invController.deleteInventory)
);

// Update inventory item
router.post(
	"/update",
	inventoryValidate.rules(),
	inventoryValidate.checkUpdateData,
	utilities.handleErrors(invController.updateInventory)
);

//Error router
router.get("/causeError", utilities.handleErrors(invController.throwError));

module.exports = router;