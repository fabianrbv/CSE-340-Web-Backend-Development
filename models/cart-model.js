const pool = require('../database/')

async function getUserCart(userId) {
  try {
    const cartRes = await pool.query('SELECT * FROM cart WHERE user_id = $1', [userId])
    const cart = cartRes.rows[0]
    if (!cart) return null
    const itemsRes = await pool.query(
      `SELECT ci.cart_item_id, ci.car_id AS inv_id, ci.quantity, i.inv_make, i.inv_model, i.inv_price
       FROM cart_items ci JOIN inventory i ON ci.car_id = i.inv_id
       WHERE ci.cart_id = $1`,
      [cart.cart_id]
    )
    cart.items = itemsRes.rows
    return cart
  } catch (error) {
    console.error('getUserCart error: ', error)
    throw error
  }
}

async function createCart(userId) {
  try {
    const res = await pool.query('INSERT INTO cart (user_id) VALUES ($1) RETURNING *', [userId])
    return res.rows[0]
  } catch (error) {
    console.error('createCart error: ', error)
    throw error
  }
}

async function addCartItem(cartId, carId, quantity) {
  try {
    const sql = `INSERT INTO cart_items (cart_id, car_id, quantity) VALUES ($1,$2,$3)
      ON CONFLICT (cart_id, car_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
      RETURNING *`
    const res = await pool.query(sql, [cartId, carId, quantity])
    return res.rows[0]
  } catch (error) {
    console.error('addCartItem error: ', error)
    throw error
  }
}

async function updateCartItem(cartId, carId, quantity) {
  try {
    const sql = 'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND car_id = $3 RETURNING *'
    const res = await pool.query(sql, [quantity, cartId, carId])
    return res.rows[0]
  } catch (error) {
    console.error('updateCartItem error: ', error)
    throw error
  }
}

async function removeCartItem(cartId, carId) {
  try {
    const res = await pool.query('DELETE FROM cart_items WHERE cart_id = $1 AND car_id = $2', [cartId, carId])
    return res
  } catch (error) {
    console.error('removeCartItem error: ', error)
    throw error
  }
}

async function getOrCreateCartForUser(userId) {
  let cart = await getUserCart(userId)
  if (!cart) {
    const created = await createCart(userId)
    cart = { ...created, items: [] }
  }
  return cart
}

module.exports = {
  getUserCart,
  createCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  getOrCreateCartForUser
}
