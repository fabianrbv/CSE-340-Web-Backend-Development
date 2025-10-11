const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()
const cartModel = require('../models/cart-model')

/* **************************************
* Build the classification select list HTML
* ************************************ */
Util.buildClassificationList = async function(selectedId = "") {
  let data = await invModel.getClassifications();
  let list = '<select id="classificationList" name="classification_id" required>';
  list += '<option value="">Choose a Classification</option>';
  data.rows.forEach(row => {
    list += `<option value="${row.classification_id}"${row.classification_id == selectedId ? " selected" : ""}>${row.classification_name}</option>`;
  });
  list += '</select>';
  return list;
}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the detail view HTML
* ************************************ */

// accountType (optional) - will only render Add-to-Cart for 'Client'
Util.buildDetailView = async function(vehicle, accountType){
  // include inv_id as a data attribute and render Add to Cart controls
  let detail = '<div class="vehicle-detail-wrapper" data-inv-id="' + (vehicle ? vehicle.inv_id : '') + '">';

  if(vehicle) {
    detail += '<div class="vehicle-image">'
    detail += `<img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">`
    detail += '</div>'
    detail += '<div class="vehicle-info">'
    detail += `<h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>`
    detail += `<p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>`
    detail += `<p><strong>Description:</strong> ${vehicle.inv_description}</p>`
    detail += `<p><strong>Color:</strong> ${vehicle.inv_color}</p>`
    detail += `<p><strong>Miles:</strong> ${vehicle.inv_miles.toLocaleString()}</p>`
    detail += '</div>'

    // Add to Cart control (calls window.cartAdd) - only for Clients
    if (accountType && accountType === 'Client') {
      detail += '<div class="add-to-cart">'
      detail += '<label for="cart-quantity">Quantity</label>'
      detail += '<input type="number" id="cart-quantity" name="quantity" min="1" value="1">'
      detail += `<button type="button" onclick="window.cartAdd(${vehicle.inv_id}, parseInt(document.getElementById('cart-quantity').value,10))">Add to Cart</button>`
      detail += '</div>'
    }

    detail += '</div>'
  } else {
    detail += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
return detail
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = async (req, res, next) => {
  if (req.cookies && req.cookies.jwt) {
    try {
      // verify returns the decoded token or throws
      const accountData = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET)
      res.locals.accountData = accountData
      res.locals.loggedin = 1
      // load cart count for header
      try {
        const cart = await cartModel.getUserCart(accountData.account_id)
        res.locals.cartCount = cart && cart.items ? cart.items.reduce((s, i) => s + i.quantity, 0) : 0
      } catch (e) {
        res.locals.cartCount = 0
      }
      return next()
    } catch (err) {
      req.flash('notice', 'Please log in')
      res.clearCookie('jwt')
      return res.redirect('/account/login')
    }
  }
  next()
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 * Middleware to check account role for inventory admin actions
 **************************************** */
Util.checkAccountType = (req, res, next) => {
  const acct = res.locals.accountData
  if (acct && (acct.account_type === 'Employee' || acct.account_type === 'Admin')) {
    next()
  } else {
    req.flash('notice', 'Please log in with an employee account to access that page.')
    return res.redirect('/account/login')
  }
}

/* ****************************************
 * Logout helper - clears jwt and session
 **************************************** */
Util.logout = (req, res) => {
  res.clearCookie('jwt')
  req.session.destroy(() => {})
  return res.redirect('/')
}

module.exports = Util