// ===== Constants =====
const PRODUCT_KEY = "badminton-products-v1";
const CART_KEY = "badminton-cart-v1";
const SESSION_KEY = "badminton-admin-session-v1";

const ADMIN_ACCOUNT = {
  username: "admin",
  // SHA-256 hash of "admin123"
  passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
};

const CATEGORIES = ["球拍", "羽毛球", "球鞋", "配件", "球包", "球网", "服饰"];

const IMAGE_OPTIONS = [
  { label: "羽毛球拍", value: "assets/racket.png" },
  { label: "羽毛球", value: "assets/shuttle.png" },
  { label: "羽毛球鞋", value: "assets/shoes.png" },
  { label: "手胶配件", value: "assets/grip.png" },
  { label: "双肩球包", value: "assets/bag.png" },
  { label: "便携球网", value: "assets/net.png" },
  { label: "训练服饰", value: "assets/apparel.png" },
  { label: "护腕配件", value: "assets/wristband.png" },
];

const currency = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
});

// ===== Utilities =====
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (Number.isNaN(number)) return min;
  return Math.min(max, Math.max(min, number));
}

let toastTimer = null;
function showToast(message) {
  clearTimeout(toastTimer);
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 2200);
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ===== Password =====
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyPassword(input) {
  const hash = await hashPassword(input);
  return hash === ADMIN_ACCOUNT.passwordHash;
}

// ===== Star rating =====
let starIdCounter = 0;
function renderStars(rating, size = 14) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let html = "";
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      html += `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" class="star-icon star-filled"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    } else if (i === full && half) {
      const gid = `hg-${++starIdCounter}`;
      html += `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" class="star-icon star-half"><defs><linearGradient id="${gid}"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#${gid})" stroke="currentColor"/></svg>`;
    } else {
      html += `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="star-icon star-empty"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
  }
  return html;
}
