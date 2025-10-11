const cartModel = require('../models/cart-model')
const utilities = require('../utilities/')

const cartCont = {}

cartCont.viewCart = async function (req, res, next) {
  try {
    const user = res.locals.accountData
    if (!user) {
      req.flash('notice', 'Please log in to view your cart.')
      return res.redirect('/account/login')
    }
    const cart = await cartModel.getOrCreateCartForUser(user.account_id)
    let nav = await utilities.getNav()
    res.render('cart/cart', { title: 'Your Cart', nav, cart })
  } catch (error) {
    next(error)
  }
}

cartCont.addToCart = async function (req, res, next) {
  try {
    const user = res.locals.accountData
    if (!user) return res.status(401).json({ error: 'Not authenticated' })
    const { car_id, quantity } = req.body
    const cart = await cartModel.getOrCreateCartForUser(user.account_id)
    await cartModel.addCartItem(cart.cart_id, car_id, parseInt(quantity, 10))
    // If request expects JSON (AJAX) respond with cart summary
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      const updatedCart = await cartModel.getUserCart(user.account_id)
      return res.json({ success: true, cart: updatedCart })
    }
    req.flash('notice', 'Item added to cart.')
    res.redirect('/cart')
  } catch (error) {
    next(error)
  }
}

cartCont.updateQuantity = async function (req, res, next) {
  try {
    const user = res.locals.accountData
    if (!user) return res.status(401).json({ error: 'Not authenticated' })
    const { car_id, quantity } = req.body
    const cart = await cartModel.getOrCreateCartForUser(user.account_id)
    await cartModel.updateCartItem(cart.cart_id, car_id, parseInt(quantity, 10))
    req.flash('notice', 'Cart updated.')
    res.redirect('/cart')
  } catch (error) {
    next(error)
  }
}

cartCont.removeFromCart = async function (req, res, next) {
  try {
    const user = res.locals.accountData
    if (!user) return res.status(401).json({ error: 'Not authenticated' })
    const { car_id } = req.body
    const cart = await cartModel.getOrCreateCartForUser(user.account_id)
    await cartModel.removeCartItem(cart.cart_id, car_id)
    req.flash('notice', 'Item removed.')
    res.redirect('/cart')
  } catch (error) {
    next(error)
  }
}

module.exports = cartCont
