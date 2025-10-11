window.cartAdd = async function(carId, quantity){
  try {
    const resp = await fetch('/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ car_id: carId, quantity })
    })
    const data = await resp.json()
    if (data && data.success) {
      const countEl = document.getElementById('cart-count')
      if (countEl) countEl.textContent = data.cart && data.cart.items ? data.cart.items.reduce((s,i)=>s + i.quantity,0) : 0
      showPageNotice('Added to cart')
    } else {
      showPageNotice('Could not add to cart', true)
    }
  } catch (err) {
    console.error(err)
    showPageNotice('Error adding to cart', true)
  }
}

function showPageNotice(message, isError = false) {
  const notice = document.getElementById('page-notice')
  if (!notice) { alert(message); return }
  notice.textContent = message
  notice.style.display = 'block'
  notice.style.background = isError ? '#ffdddd' : '#ddffdd'
  clearTimeout(window._pageNoticeTimeout)
  window._pageNoticeTimeout = setTimeout(() => { notice.style.display = 'none' }, 3000)
}
