// ===== State =====
let activeCategory = "全部";

// ===== DOM refs =====
const els = {
  views: document.querySelectorAll(".view"),
  navTargets: document.querySelectorAll("[data-view-target]"),
  productGrid: document.querySelector("#productGrid"),
  emptyProducts: document.querySelector("#emptyProducts"),
  searchInput: document.querySelector("#searchInput"),
  sortSelect: document.querySelector("#sortSelect"),
  categoryFilters: document.querySelector("#categoryFilters"),
  metricSku: document.querySelector("#metricSku"),
  metricStock: document.querySelector("#metricStock"),
  metricSold: document.querySelector("#metricSold"),
  featuredProduct: document.querySelector("#featuredProduct"),
  featuredImage: document.querySelector("#featuredImage"),
  featuredName: document.querySelector("#featuredName"),
  featuredIntro: document.querySelector("#featuredIntro"),
  featuredDetailButton: document.querySelector("#featuredDetailButton"),
  cartButton: document.querySelector("#cartButton"),
  cartCount: document.querySelector("#cartCount"),
  overlay: document.querySelector("#overlay"),
  cartList: document.querySelector("#cartList"),
  cartTotal: document.querySelector("#cartTotal"),
  checkoutButton: document.querySelector("#checkoutButton"),
  productDialog: document.querySelector("#productDialog"),
  dialogContent: document.querySelector("#dialogContent"),
  closeDialogButton: document.querySelector("#closeDialogButton"),
  toast: document.querySelector("#toast"),
  loginPanel: document.querySelector("#loginPanel"),
  logoutButton: document.querySelector("#logoutButton"),
  adminPanel: document.querySelector("#adminPanel"),
  productForm: document.querySelector("#productForm"),
  formTitle: document.querySelector("#formTitle"),
  submitProductText: document.querySelector("#submitProductText"),
  resetFormButton: document.querySelector("#resetFormButton"),
  productId: document.querySelector("#productId"),
  productName: document.querySelector("#productName"),
  productCategory: document.querySelector("#productCategory"),
  productPrice: document.querySelector("#productPrice"),
  productStock: document.querySelector("#productStock"),
  productSold: document.querySelector("#productSold"),
  productRating: document.querySelector("#productRating"),
  productLevel: document.querySelector("#productLevel"),
  productImage: document.querySelector("#productImage"),
  productImageUpload: document.querySelector("#productImageUpload"),
  productIntro: document.querySelector("#productIntro"),
  productSpecs: document.querySelector("#productSpecs"),
  productTableBody: document.querySelector("#productTableBody"),
  dashSku: document.querySelector("#dashSku"),
  dashInventory: document.querySelector("#dashInventory"),
  dashRevenue: document.querySelector("#dashRevenue"),
  dashLowStock: document.querySelector("#dashLowStock"),
  categoryBars: document.querySelector("#categoryBars"),
  salesRank: document.querySelector("#salesRank"),
};

// ===== Init =====
function init() {
  populateAdminSelects();
  resetProductForm();
  bindEvents();
  renderAll();
  updateAdminState();
  refreshIcons();
}

// ===== View navigation =====
function setView(viewName) {
  els.views.forEach((view) => view.classList.remove("active"));
  document.querySelector(`#${viewName}View`)?.classList.add("active");

  els.navTargets.forEach((target) => {
    target.classList.toggle("active", target.dataset.viewTarget === viewName);
  });

  closeCart();
  if (viewName === "admin") renderAdmin();
  window.scrollTo({ top: 0, behavior: "smooth" });
  refreshIcons();
}

// ===== Store: metrics & featured =====
function renderMetrics() {
  const m = getTotalMetrics();
  els.metricSku.textContent = m.sku;
  els.metricStock.textContent = m.stock;
  els.metricSold.textContent = m.sold;
}

function renderFeatured() {
  const featured = getFeaturedProduct();
  if (!featured) {
    els.featuredImage.src = "";
    els.featuredImage.alt = "暂无精选商品";
    els.featuredName.textContent = "暂无商品";
    els.featuredIntro.textContent = "请先在管理台添加商品。";
    els.featuredDetailButton.disabled = true;
    return;
  }

  els.featuredImage.src = featured.image;
  els.featuredImage.alt = featured.name;
  els.featuredName.textContent = featured.name;
  els.featuredIntro.textContent = featured.intro;
  els.featuredDetailButton.disabled = false;
}

// ===== Store: filters & product grid =====
function renderFilters() {
  const categories = ["全部", ...CATEGORIES.filter((cat) => products.some((p) => p.category === cat))];

  els.categoryFilters.innerHTML = categories
    .map(
      (cat) => `
        <button class="category-button ${cat === activeCategory ? "active" : ""}" type="button" data-category="${escapeHtml(cat)}">
          ${escapeHtml(cat)}
        </button>
      `,
    )
    .join("");
}

function getVisibleProducts() {
  const keyword = els.searchInput.value.trim().toLowerCase();
  const sortMode = els.sortSelect.value;

  const filtered = products.filter((product) => {
    const matchesCategory = activeCategory === "全部" || product.category === activeCategory;
    const source = `${product.name} ${product.category} ${product.intro} ${product.specs}`.toLowerCase();
    return matchesCategory && source.includes(keyword);
  });

  const sorters = {
    popular: (a, b) => b.sold - a.sold,
    rating: (a, b) => b.rating - a.rating,
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,
    stock: (a, b) => b.stock - a.stock,
  };

  return [...filtered].sort(sorters[sortMode] || sorters.popular);
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();
  els.emptyProducts.classList.toggle("hidden", visibleProducts.length > 0);
  els.productGrid.innerHTML = visibleProducts.map(renderProductCard).join("");
  refreshIcons();
}

const debouncedRenderProducts = debounce(renderProducts, 200);

function renderProductCard(product) {
  const stockLabel = product.stock <= 0 ? "售罄" : product.stock < 12 ? "低库存" : `库存 ${product.stock}`;
  const stockClass = product.stock < 12 ? "low" : "";

  return `
    <article class="product-card">
      <div class="product-media">
        <img src="${escapeAttr(product.image)}" alt="${escapeAttr(product.name)}" />
        <span class="stock-pill ${stockClass}">${escapeHtml(stockLabel)}</span>
      </div>
      <div class="product-body">
        <div class="product-title">
          <div class="product-meta">
            <span class="chip">${escapeHtml(product.category)}</span>
            <span>${escapeHtml(product.level)}</span>
            <span class="stars-row">${renderStars(product.rating, 13)} ${product.rating.toFixed(1)}</span>
          </div>
          <h3>${escapeHtml(product.name)}</h3>
        </div>
        <p class="product-intro">${escapeHtml(product.intro)}</p>
        <div class="product-specs">
          <span>${escapeHtml(product.specs)}</span>
        </div>
        <div class="product-foot">
          <span class="price">${currency.format(product.price)}</span>
          <div class="card-actions">
            <button class="outline-button" type="button" data-detail="${escapeAttr(product.id)}">
              <i data-lucide="eye"></i>
              <span>详情</span>
            </button>
            <button class="primary-button" type="button" data-add="${escapeAttr(product.id)}" ${product.stock <= 0 ? "disabled" : ""}>
              <i data-lucide="shopping-bag"></i>
              <span>加入</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

// ===== Product dialog =====
function openProductDialog(productId) {
  const product = getProduct(productId);
  if (!product) return;

  els.dialogContent.innerHTML = `
    <div class="dialog-body">
      <img src="${escapeAttr(product.image)}" alt="${escapeAttr(product.name)}" />
      <div class="dialog-info">
        <div>
          <p class="eyebrow">${escapeHtml(product.category)}</p>
          <h2>${escapeHtml(product.name)}</h2>
        </div>
        <p>${escapeHtml(product.intro)}</p>
        <div class="dialog-meta">
          <span class="chip">${escapeHtml(product.level)}</span>
          <span class="chip stars-row">${renderStars(product.rating, 14)} ${product.rating.toFixed(1)}</span>
          <span class="chip">库存 ${escapeHtml(String(product.stock))}</span>
          <span class="chip">已售 ${escapeHtml(String(product.sold))}</span>
        </div>
        <p>${escapeHtml(product.specs)}</p>
        <div class="product-foot">
          <span class="price">${currency.format(product.price)}</span>
          <button class="primary-button" type="button" data-dialog-add="${escapeAttr(product.id)}" ${product.stock <= 0 ? "disabled" : ""}>
            <i data-lucide="shopping-bag"></i>
            <span>加入购物袋</span>
          </button>
        </div>
      </div>
    </div>
  `;

  els.dialogContent.querySelector("[data-dialog-add]")?.addEventListener("click", (event) => {
    addToCart(event.currentTarget.dataset.dialogAdd);
  });

  els.productDialog.showModal();
  refreshIcons();
}

// ===== Admin: dashboard =====
function renderDashboard() {
  const m = getTotalMetrics();
  els.dashSku.textContent = m.sku;
  els.dashInventory.textContent = currency.format(m.inventoryValue);
  els.dashRevenue.textContent = currency.format(m.revenue);
  els.dashLowStock.textContent = m.lowStockCount;
  bindLowStockClick();

  // Category bars
  const catStats = getCategoryStats();
  const maxSold = Math.max(1, ...catStats.map((item) => item.sold));
  els.categoryBars.innerHTML = catStats
    .map(
      (item) => `
        <div class="bar-item">
          <header>
            <strong>${escapeHtml(item.category)}</strong>
            <small>${item.count} 款 / 已售 ${item.sold} / 库存 ${item.stock}</small>
          </header>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${Math.max(8, Math.round((item.sold / maxSold) * 100))}%"></div>
          </div>
        </div>
      `,
    )
    .join("");

  // Sales rank
  els.salesRank.innerHTML = [...products]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5)
    .map(
      (product, index) => `
        <div class="rank-item">
          <div>
            <strong>${index + 1}. ${escapeHtml(product.name)}</strong>
            <span>${escapeHtml(product.category)} / 库存 ${escapeHtml(String(product.stock))}</span>
          </div>
          <strong>${product.sold}</strong>
        </div>
      `,
    )
    .join("");
}

function renderProductTable() {
  els.productTableBody.innerHTML = products
    .map(
      (product) => `
        <tr>
          <td>
            <div class="table-product">
              <img src="${escapeAttr(product.image)}" alt="${escapeAttr(product.name)}" />
              <div>
                <strong>${escapeHtml(product.name)}</strong>
                <div class="product-meta">${escapeHtml(product.level)} / ${renderStars(product.rating, 12)} ${product.rating.toFixed(1)}</div>
              </div>
            </div>
          </td>
          <td>${escapeHtml(product.category)}</td>
          <td>${currency.format(product.price)}</td>
          <td>${escapeHtml(String(product.stock))}</td>
          <td>${escapeHtml(String(product.sold))}</td>
          <td>
            <div class="table-actions">
              <button class="outline-button" type="button" data-edit="${escapeAttr(product.id)}">
                <i data-lucide="pencil"></i>
                <span>编辑</span>
              </button>
              <button class="outline-button danger-button" type="button" data-delete="${escapeAttr(product.id)}">
                <i data-lucide="trash-2"></i>
                <span>删除</span>
              </button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");
  refreshIcons();
}

function renderAdmin() {
  if (!isAdminLoggedIn()) return;
  renderDashboard();
  renderProductTable();
}

// ===== Admin: low stock click =====
function bindLowStockClick() {
  const lowStockCard = document.querySelector("#dashLowStock").closest(".metric-card");
  if (lowStockCard) {
    lowStockCard.style.cursor = "pointer";
    lowStockCard.title = "点击筛选低库存商品";
    lowStockCard.addEventListener("click", filterLowStockInStore);
  }
}

function filterLowStockInStore() {
  setView("store");
  activeCategory = "全部";
  els.searchInput.value = "";
  els.sortSelect.value = "stock";
  renderFilters();
  renderProducts();
  // Highlight low-stock items briefly
  showToast("已按库存从低到高排列，低库存商品高亮显示");
}

// ===== Admin: auth =====
function isAdminLoggedIn() {
  return localStorage.getItem(SESSION_KEY) === "active";
}

function updateAdminState() {
  const loggedIn = isAdminLoggedIn();
  els.loginPanel.classList.toggle("hidden", loggedIn);
  els.adminPanel.classList.toggle("hidden", !loggedIn);
  els.logoutButton.classList.toggle("hidden", !loggedIn);
  if (loggedIn) renderAdmin();
  refreshIcons();
}

// ===== Admin: product form =====
function populateAdminSelects() {
  els.productCategory.innerHTML = CATEGORIES.map((cat) => `<option>${escapeHtml(cat)}</option>`).join("");
  els.productImage.innerHTML = IMAGE_OPTIONS.map(
    (opt) => `<option value="${escapeAttr(opt.value)}">${escapeHtml(opt.label)}</option>`,
  ).join("");
}

function saveProductFromForm(event) {
  event.preventDefault();

  const productId = els.productId.value;
  const imageValue = els.productImage.value;

  const payload = {
    id: productId || `p-${Date.now()}`,
    name: els.productName.value.trim(),
    category: els.productCategory.value,
    price: clampNumber(els.productPrice.value, 1, 99999),
    stock: clampNumber(els.productStock.value, 0, 99999),
    sold: clampNumber(els.productSold.value, 0, 99999),
    rating: clampNumber(els.productRating.value, 0, 5),
    level: els.productLevel.value,
    image: imageValue,
    intro: els.productIntro.value.trim(),
    specs: els.productSpecs.value.trim(),
  };

  if (!payload.name || !payload.intro || !payload.specs) {
    showToast("请完整填写商品信息");
    return;
  }

  const existing = getProduct(productId);
  if (existing) {
    updateProduct(payload);
    showToast("商品已更新");
  } else {
    addProduct(payload);
    showToast("商品已新增");
  }

  resetProductForm();
  renderAll();
}

function editProduct(productId) {
  const product = getProduct(productId);
  if (!product) return;

  els.productId.value = product.id;
  els.productName.value = product.name;
  els.productCategory.value = product.category;
  els.productPrice.value = product.price;
  els.productStock.value = product.stock;
  els.productSold.value = product.sold;
  els.productRating.value = product.rating;
  els.productLevel.value = product.level;
  els.productImage.value = product.image;
  els.productIntro.value = product.intro;
  els.productSpecs.value = product.specs;
  els.formTitle.textContent = "编辑商品";
  els.submitProductText.textContent = "更新商品";
  els.productName.focus();
}

function deleteProduct(productId) {
  const product = getProduct(productId);
  if (!product) return;

  if (!window.confirm(`确定删除「${product.name}」吗？`)) return;

  deleteProductById(productId);
  cart = cart.filter((line) => line.id !== productId);
  saveCart();
  resetProductForm();
  renderAll();
  showToast("商品已删除");
}

function resetProductForm() {
  els.productForm.reset();
  els.productId.value = "";
  els.productRating.value = "4.6";
  els.productStock.value = "20";
  els.productSold.value = "0";
  els.formTitle.textContent = "新增商品";
  els.submitProductText.textContent = "保存商品";
}

// ===== Admin: export / import =====
function exportData() {
  const json = exportProductsJSON();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `badminton-products-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("商品数据已导出");
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      importProductsJSON(reader.result);
      renderAll();
      showToast(`成功导入 ${products.length} 件商品`);
    } catch (e) {
      showToast(e.message || "导入失败，请检查文件格式");
    }
  };
  reader.readAsText(file);
}

// ===== Admin: image upload =====
function handleImageUpload(file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast("请选择图片文件");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    // Add as a new option in the image select
    const option = document.createElement("option");
    option.value = dataUrl;
    option.textContent = `📷 ${file.name}`;
    option.dataset.uploaded = "true";
    els.productImage.insertBefore(option, els.productImage.firstChild);
    els.productImage.value = dataUrl;
    showToast("图片已上传");
  };
  reader.readAsDataURL(file);
}

// ===== Render all =====
function renderAll() {
  renderMetrics();
  renderFeatured();
  renderFilters();
  renderProducts();
  renderCart();
  renderAdmin();
  refreshIcons();
}

// ===== Event binding =====
function bindEvents() {
  // Navigation
  els.navTargets.forEach((target) => {
    target.addEventListener("click", () => setView(target.dataset.viewTarget));
  });

  // Search with debounce
  els.searchInput.addEventListener("input", () => {
    debouncedRenderProducts();
  });

  els.sortSelect.addEventListener("change", renderProducts);

  // Category filter
  els.categoryFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    renderFilters();
    renderProducts();
  });

  // Product grid actions
  els.productGrid.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add]");
    const detailButton = event.target.closest("[data-detail]");
    if (addButton) addToCart(addButton.dataset.add);
    if (detailButton) openProductDialog(detailButton.dataset.detail);
  });

  // Featured detail
  els.featuredDetailButton.addEventListener("click", () => {
    const featured = getFeaturedProduct();
    if (featured) openProductDialog(featured.id);
  });

  // Cart drawer
  els.cartButton.addEventListener("click", openCart);
  document.querySelector("#closeCartButton").addEventListener("click", closeCart);

  // Overlay click to close
  els.overlay.addEventListener("click", closeCart);

  // Cart actions
  els.cartList.addEventListener("click", (event) => {
    const qtyButton = event.target.closest("[data-qty]");
    const removeButton = event.target.closest("[data-remove]");
    if (qtyButton) updateCartQty(qtyButton.dataset.qty, Number(qtyButton.dataset.delta));
    if (removeButton) removeFromCart(removeButton.dataset.remove);
  });

  // Checkout
  els.checkoutButton.addEventListener("click", checkout);

  // Dialog close
  els.closeDialogButton.addEventListener("click", () => els.productDialog.close());

  // Admin login
  els.loginPanel.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.querySelector("#adminUser").value.trim();
    const password = document.querySelector("#adminPass").value;

    if (username === ADMIN_ACCOUNT.username && (await verifyPassword(password))) {
      localStorage.setItem(SESSION_KEY, "active");
      els.loginPanel.reset();
      updateAdminState();
      showToast("已进入管理员工作台");
      return;
    }
    showToast("账户或密码不正确");
  });

  // Admin logout
  els.logoutButton.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    updateAdminState();
    showToast("已退出管理台");
  });

  // Product form
  els.productForm.addEventListener("submit", saveProductFromForm);
  els.resetFormButton.addEventListener("click", resetProductForm);

  // Product table actions
  els.productTableBody.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");
    if (editButton) editProduct(editButton.dataset.edit);
    if (deleteButton) deleteProduct(deleteButton.dataset.delete);
  });

  // Image upload
  els.productImageUpload.addEventListener("change", (event) => {
    if (event.target.files[0]) handleImageUpload(event.target.files[0]);
    event.target.value = "";
  });

  // Export data
  document.querySelector("#exportDataButton").addEventListener("click", exportData);

  // Import data
  document.querySelector("#importDataButton").addEventListener("click", () => {
    document.querySelector("#importDataInput").click();
  });
  document.querySelector("#importDataInput").addEventListener("change", (event) => {
    if (event.target.files[0]) importData(event.target.files[0]);
    event.target.value = "";
  });

  // ESC key: close drawer & dialog
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (els.productDialog.open) return; // Let browser handle dialog ESC
      closeCart();
    }
  });

  // Dialog backdrop click to close
  els.productDialog.addEventListener("click", (event) => {
    if (event.target === els.productDialog) els.productDialog.close();
  });
}

// ===== Boot =====
init();
