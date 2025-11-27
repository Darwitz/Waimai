// 简易外卖前端 (纯静态，使用 localStorage)
const SAMPLE_MENU = [
  { id:1, name:'宫保鸡丁', desc:'微辣，配花生', price:28 },
  { id:2, name:'麻辣香锅', desc:'香辣可选', price:45 },
  { id:3, name:'鱼香肉丝', desc:'甜酸口味', price:26 },
  { id:4, name:'番茄炒蛋', desc:'家常时令菜', price:18 },
  { id:5, name:'酸辣汤', desc:'暖胃必备', price:12 },
];

function qs(sel){return document.querySelector(sel);}
function qsa(sel){return document.querySelectorAll(sel);}

const menuEl = qs('#menu');
const cartCountEl = qs('#cart-count');
const cartModal = qs('#cart-modal');
const checkoutModal = qs('#checkout-modal');
const cartContents = qs('#cart-contents');
const subtotalEl = qs('#subtotal');

let cart = JSON.parse(localStorage.getItem('wm_cart')||'{}');

function renderMenu(){
  menuEl.innerHTML = '';
  SAMPLE_MENU.forEach(p=>{
    const div = document.createElement('div');
    div.className='card';
    div.innerHTML = `<div class="name">${p.name}</div>
      <div class="desc">${p.desc}</div>
      <div class="price">¥${p.price.toFixed(2)}</div>
      <div class="actions">
        <button class="btn add" data-id="${p.id}">加入</button>
        <button class="btn" data-id="${p.id}" data-add="5">+5</button>
      </div>`;
    menuEl.appendChild(div);
  });
}

function cartItems(){
  return Object.entries(cart).map(([id,qty])=>{
    const p = SAMPLE_MENU.find(x=>x.id===Number(id));
    return {...p, qty};
  });
}

function subtotal(){
  return cartItems().reduce((s,it)=>s + it.price*it.qty, 0);
}

function renderCartCount(){
  const count = cartItems().reduce((s,it)=>s+it.qty,0);
  cartCountEl.textContent = count;
}

function renderCart(){
  const items = cartItems();
  cartContents.innerHTML = '';
  if(items.length===0){
    cartContents.innerHTML = '<div style="color:#666">购物车空</div>';
  } else {
    items.forEach(it=>{
      const r = document.createElement('div');
      r.className='cart-item';
      r.innerHTML = `<div>
        <div style="font-weight:600">${it.name}</div>
        <div style="font-size:13px;color:#666">¥${it.price.toFixed(2)} × ${it.qty}</div>
      </div>
      <div>
        <button class="btn" data-dec="${it.id}">-</button>
        <span style="padding:0 8px">${it.qty}</span>
        <button class="btn" data-inc="${it.id}">+</button>
      </div>`;
      cartContents.appendChild(r);
    });
  }
  subtotalEl.textContent = '¥' + subtotal().toFixed(2);
  renderCartCount();
  localStorage.setItem('wm_cart', JSON.stringify(cart));
}

// events
document.body.addEventListener('click', (e)=>{
  const add = e.target.closest('[data-id]');
  if(add){
    const id = add.getAttribute('data-id');
    const add5 = add.getAttribute('data-add');
    const qty = add5 ? Number(add5) : 1;
    cart[id] = (cart[id]||0) + qty;
    renderCart();
    return;
  }
  const dec = e.target.closest('[data-dec]');
  if(dec){
    const id = dec.getAttribute('data-dec');
    cart[id] = (cart[id]||0) - 1;
    if(cart[id] <= 0) delete cart[id];
    renderCart();
    return;
  }
  const inc = e.target.closest('[data-inc]');
  if(inc){
    const id = inc.getAttribute('data-inc');
    cart[id] = (cart[id]||0) + 1;
    renderCart();
    return;
  }
  if(e.target.id === 'open-cart'){
    cartModal.classList.remove('hidden');
    renderCart();
  }
  if(e.target.id === 'close-cart'){
    cartModal.classList.add('hidden');
  }
  if(e.target.id === 'clear-cart'){
    cart = {};
    renderCart();
  }
  if(e.target.id === 'checkout'){
    cartModal.classList.add('hidden');
    checkoutModal.classList.remove('hidden');
  }
  if(e.target.id === 'close-checkout'){
    checkoutModal.classList.add('hidden');
  }
  if(e.target.id === 'back-to-cart'){
    checkoutModal.classList.add('hidden');
    cartModal.classList.remove('hidden');
  }
});

// submit order (simulated)
qs('#order-form').addEventListener('submit', (ev)=>{
  ev.preventDefault();
  const name = qs('#name').value.trim();
  const phone = qs('#phone').value.trim();
  const address = qs('#address').value.trim();
  if(!name || !phone || !address){ alert('请填写姓名/电话/地址'); return; }
  const order = {
    id: 'ORD' + Date.now(),
    items: cartItems(),
    total: subtotal(),
    info: {name, phone, address, note: qs('#note').value||''},
    createdAt: new Date().toISOString(),
    status: '提交中'
  };
  let orders = JSON.parse(localStorage.getItem('wm_orders')||'[]');
  orders.unshift(order);
  localStorage.setItem('wm_orders', JSON.stringify(orders));
  cart = {};
  localStorage.setItem('wm_cart', JSON.stringify(cart));
  renderCart();
  checkoutModal.classList.add('hidden');
  alert('订单已提交（模拟）。本示例不含真实支付。如需接入微信/Stripe，请参考我之前的说明。');
});

// init
renderMenu();
renderCart();
