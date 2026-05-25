// ===== Seed data =====
const SEED_PRODUCTS = [
  {
    id: "p-racket-900",
    name: "星羽 Phantom 900 羽毛球拍",
    category: "球拍",
    price: 899,
    stock: 26,
    sold: 142,
    rating: 4.9,
    level: "专业",
    image: "assets/racket.png",
    intro: "速度型进攻球拍，拍头回弹干脆，适合中后场连续下压。",
    specs: "4U / G5 / 中杆偏硬 / 最高 30 磅",
  },
  {
    id: "p-shuttle-76",
    name: "Arena 76 鹅毛比赛球",
    category: "羽毛球",
    price: 128,
    stock: 58,
    sold: 318,
    rating: 4.8,
    level: "专业",
    image: "assets/shuttle.png",
    intro: "飞行轨迹稳定，落点清晰，适合馆内比赛和高强度训练。",
    specs: "12 只装 / 76 速 / 鹅刀翎 / 软木球头",
  },
  {
    id: "p-shoes-v8",
    name: "云速 V8 羽毛球鞋",
    category: "球鞋",
    price: 529,
    stock: 18,
    sold: 96,
    rating: 4.7,
    level: "进阶",
    image: "assets/shoes.png",
    intro: "侧向支撑稳，前掌启动轻快，适合双打快节奏移动。",
    specs: "止滑橡胶 / TPU 支撑 / 前掌缓震",
  },
  {
    id: "p-grip-flex",
    name: "FlexGrip 吸汗手胶",
    category: "配件",
    price: 36,
    stock: 104,
    sold: 455,
    rating: 4.6,
    level: "训练",
    image: "assets/grip.png",
    intro: "细腻防滑纹理，吸汗速度快，适合日常训练频繁更换。",
    specs: "3 条装 / 0.65mm / 高吸汗 / 多色",
  },
  {
    id: "p-bag-court",
    name: "ProCourt 双肩球包",
    category: "球包",
    price: 299,
    stock: 22,
    sold: 73,
    rating: 4.5,
    level: "进阶",
    image: "assets/bag.png",
    intro: "独立球拍仓和鞋仓，适合通勤训练与周末比赛携带。",
    specs: "6 支拍位 / 独立鞋仓 / 防泼水面料",
  },
  {
    id: "p-net-portable",
    name: "SwiftNet 便携训练球网",
    category: "球网",
    price: 219,
    stock: 9,
    sold: 41,
    rating: 4.4,
    level: "训练",
    image: "assets/net.png",
    intro: "快速展开，适合社区、学校和临时训练场景。",
    specs: "3.1m 宽 / 可折叠支架 / 便携收纳",
  },
  {
    id: "p-shirt-dry",
    name: "CoreDry 速干训练服",
    category: "服饰",
    price: 169,
    stock: 35,
    sold: 128,
    rating: 4.7,
    level: "训练",
    image: "assets/apparel.png",
    intro: "轻量透气，肩背活动空间充足，长时间训练不黏身。",
    specs: "速干纤维 / 宽松肩袖 / 男女同款",
  },
  {
    id: "p-wristband-balance",
    name: "Balance 训练护腕",
    category: "配件",
    price: 59,
    stock: 48,
    sold: 207,
    rating: 4.5,
    level: "入门",
    image: "assets/wristband.png",
    intro: "柔软亲肤，吸汗不闷，适合多拍拉吊和夏季训练。",
    specs: "2 只装 / 弹力棉 / 加宽织带",
  },
];

// ===== Product state =====
let products = loadProducts();

function loadProducts() {
  const saved = localStorage.getItem(PRODUCT_KEY);
  if (!saved) {
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(SEED_PRODUCTS));
    return [...SEED_PRODUCTS];
  }
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : [...SEED_PRODUCTS];
  } catch {
    return [...SEED_PRODUCTS];
  }
}

function saveProducts() {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
}

function getProduct(id) {
  return products.find((p) => p.id === id);
}

function addProduct(payload) {
  products = [payload, ...products];
  saveProducts();
}

function updateProduct(payload) {
  const idx = products.findIndex((p) => p.id === payload.id);
  if (idx >= 0) products[idx] = payload;
  saveProducts();
}

function deleteProductById(id) {
  products = products.filter((p) => p.id !== id);
  saveProducts();
}

function getFeaturedProduct() {
  const sorted = [...products].sort((a, b) => b.rating - a.rating || b.sold - a.sold);
  return sorted[0] || null;
}

function getLowStockProducts() {
  return products.filter((p) => p.stock < 12);
}

function getCategoryStats() {
  return CATEGORIES.map((cat) => {
    const catProducts = products.filter((p) => p.category === cat);
    return {
      category: cat,
      sold: catProducts.reduce((sum, p) => sum + p.sold, 0),
      stock: catProducts.reduce((sum, p) => sum + p.stock, 0),
      count: catProducts.length,
    };
  }).filter((item) => item.count > 0);
}

function getTotalMetrics() {
  return {
    sku: products.length,
    stock: products.reduce((sum, p) => sum + p.stock, 0),
    sold: products.reduce((sum, p) => sum + p.sold, 0),
    inventoryValue: products.reduce((sum, p) => sum + p.stock * p.price, 0),
    revenue: products.reduce((sum, p) => sum + p.sold * p.price, 0),
    lowStockCount: products.filter((p) => p.stock < 12).length,
  };
}

function exportProductsJSON() {
  return JSON.stringify(products, null, 2);
}

function importProductsJSON(jsonString) {
  const parsed = JSON.parse(jsonString);
  if (!Array.isArray(parsed)) throw new Error("数据格式不正确，需要商品数组");
  products = parsed;
  saveProducts();
}
