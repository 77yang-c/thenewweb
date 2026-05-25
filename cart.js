// ===== Cart state =====
let cart = loadCart();

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function resetCart() {
  cart = [];
  saveCart();
}

function addToCart(productId) {
  const product = getProduct(productId);
  if (!product || product.stock <= 0) {
    showToast("该商品暂时无货");
    return;
  }

  const line = cart.find((item) => item.id === productId);
  const nextQty = line ? line.qty + 1 : 1;

  if (nextQty > product.stock) {
    showToast("购物袋数量已达到当前库存");
    return;
  }

  if (line) {
    line.qty = nextQty;
  } else {
    cart.push({ id: productId, qty: 1 });
  }

  saveCart();
  renderCart();
  showToast("已加入购物袋");
}

function updateCartQty(productId, delta) {
  const line = cart.find((item) => item.id === productId);
  const product = getProduct(productId);
  if (!line || !product) return;

  const nextQty = line.qty + delta;
  if (nextQty <= 0) {
    removeFromCart(productId);
    return;
  }

  if (nextQty > product.stock) {
    showToast("购物袋数量已达到当前库存");
    return;
  }

  line.qty = nextQty;
  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((line) => line.id !== productId);
  saveCart();
  renderCart();
}

function renderCart() {
  const lines = cart
    .map((line) => ({ ...line, product: getProduct(line.id) }))
    .filter((line) => line.product);

  const totalQty = lines.reduce((sum, line) => sum + line.qty, 0);
  const totalPrice = lines.reduce((sum, line) => sum + line.qty * line.product.price, 0);

  const cartCount = document.querySelector("#cartCount");
  const cartTotal = document.querySelector("#cartTotal");
  const cartList = document.querySelector("#cartList");
  const checkoutButton = document.querySelector("#checkoutButton");

  cartCount.textContent = totalQty;
  cartTotal.textContent = currency.format(totalPrice);
  checkoutButton.disabled = lines.length === 0;

  if (!lines.length) {
    cartList.innerHTML = `
      <div class="empty-state">
        <i data-lucide="shopping-bag"></i>
        <p>购物袋是空的</p>
      </div>
    `;
    refreshIcons();
    return;
  }

  cartList.innerHTML = lines
    .map(
      ({ product, qty }) => `
        <article class="cart-item">
          <div class="cart-main">
            <img src="${escapeAttr(product.image)}" alt="${escapeAttr(product.name)}" />
            <div>
              <strong>${escapeHtml(product.name)}</strong>
              <div class="product-meta">
                <span>${currency.format(product.price)}</span>
                <span>库存 ${escapeHtml(String(product.stock))}</span>
              </div>
              <div class="qty-control">
                <button type="button" data-qty="${escapeAttr(product.id)}" data-delta="-1" aria-label="减少数量">-</button>
                <span>${qty}</span>
                <button type="button" data-qty="${escapeAttr(product.id)}" data-delta="1" aria-label="增加数量">+</button>
              </div>
            </div>
          </div>
          <button class="ghost-button" type="button" data-remove="${escapeAttr(product.id)}" aria-label="移除商品">
            <i data-lucide="trash-2"></i>
          </button>
        </article>
      `,
    )
    .join("");

  refreshIcons();
}

// Returns null if valid, or the problem line if invalid
function validateCart() {
  for (const line of cart) {
    const product = getProduct(line.id);
    if (!product) return { line, reason: "商品已下架" };
    if (line.qty > product.stock) return { line, product, reason: `「${product.name}」库存不足（剩余 ${product.stock} 件）` };
  }
  return null;
}

function checkout() {
  if (cart.length === 0) return;

  const invalid = validateCart();
  if (invalid) {
    showToast(invalid.reason);
    renderCart();
    return;
  }

  if (!window.confirm(`确认结算 ${cart.length} 件商品吗？结算后将扣减库存。`)) return;

  cart.forEach((line) => {
    const product = getProduct(line.id);
    product.stock -= line.qty;
    product.sold += line.qty;
  });

  resetCart();
  saveProducts();
  renderAll();
  closeCart();
  showToast("结算完成，商品数据已更新");
}

function openCart() {
  document.querySelector("#cartDrawer").classList.add("open");
  document.querySelector("#overlay").classList.remove("hidden");
}

function closeCart() {
  document.querySelector("#cartDrawer").classList.remove("open");
  document.querySelector("#overlay").classList.add("hidden");
}
