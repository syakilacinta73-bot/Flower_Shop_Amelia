// Data Akun Kasir
const users = [
  { username: "amelia", password: "123", name: "Amelia (Owner)" },
  { username: "kasir", password: "123", name: "Kasir Toko" }
];

// Data Katalog Bunga Flower Shop Amelia
const products = [
  { id: 1, name: "Buket Mawar Pink Pastel", category: "Buket Tangan", price: 125000, emoji: "💐" },
  { id: 2, name: "Buket Tulip Putih Elegan", category: "Buket Tangan", price: 165000, emoji: "🌷" },
  { id: 3, name: "Buket Bunga Matahari", category: "Buket Tangan", price: 110000, emoji: "🌻" },
  { id: 4, name: "Mawar Merah Segar (Tangkai)", category: "Bunga Tangkai", price: 25000, emoji: "🌹" },
  { id: 5, name: "Bunga Lily Harum (Tangkai)", category: "Bunga Tangkai", price: 35000, emoji: "🪷" },
  { id: 6, name: "Bunga Sakura Mini", category: "Bunga Tangkai", price: 30000, emoji: "🌸" },
  { id: 7, name: "Pot Anggrek Bulan Ungu", category: "Vas & Pot", price: 185000, emoji: "🪻" },
  { id: 8, name: "Vas Kaca Kembang Sepatu", category: "Vas & Pot", price: 95000, emoji: "🌺" }
];

let currentUser = null;
let cart = [];
let activeCategory = "Semua";
let searchKeyword = "";

// Cek Status Login Saat Halaman Dibuka
function checkAuth() {
  const savedUser = sessionStorage.getItem("flowerShopUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showApp();
  } else {
    showLogin();
  }
}

function showApp() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("appWrapper").style.display = "block";
  document.getElementById("cashierBadge").textContent = "👩‍💼 " + currentUser.name;
  renderProducts();
}

function showLogin() {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("appWrapper").style.display = "none";
  document.getElementById("loginForm").reset();
  document.getElementById("loginError").textContent = "";
}

// Proses Login
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("usernameInput").value.trim().toLowerCase();
  const password = document.getElementById("passwordInput").value;
  const errorEl = document.getElementById("loginError");

  const foundUser = users.find(u => u.username === username && u.password === password);

  if (foundUser) {
    currentUser = foundUser;
    sessionStorage.setItem("flowerShopUser", JSON.stringify(foundUser));
    errorEl.textContent = "";
    showApp();
  } else {
    errorEl.textContent = "Username atau password salah!";
  }
});

// Proses Logout
document.getElementById("btnLogout").addEventListener("click", () => {
  sessionStorage.removeItem("flowerShopUser");
  currentUser = null;
  cart = [];
  updateCartUI();
  showLogin();
});

// Format Angka ke Rupiah
function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

// Menampilkan Produk ke Layar
function renderProducts() {
  const grid = document.getElementById("productGrid");
  const filtered = products.filter(item => {
    const matchCategory = activeCategory === "Semua" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchCategory && matchSearch;
  });

  grid.innerHTML = filtered.map(item => `
    <div class="product-card">
      <div>
        <div class="product-emoji">${item.emoji}</div>
        <span class="product-cat">${item.category}</span>
        <h3 class="product-title">${item.name}</h3>
        <p class="product-price">${formatRupiah(item.price)}</p>
      </div>
      <button class="btn-add" onclick="addToCart(${item.id})">+ Tambah</button>
    </div>
  `).join("");
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCartUI();
}

function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  updateCartUI();
}

function getTotalPrice() {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function updateCartUI() {
  const cartContainer = document.getElementById("cartItems");
  const totalEl = document.getElementById("totalPrice");

  if (cart.length === 0) {
    cartContainer.innerHTML = `<p class="empty-msg">Belum ada bunga yang dipilih.</p>`;
  } else {
    cartContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.emoji} ${item.name}</h4>
          <span>${formatRupiah(item.price)} x ${item.qty}</span>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
    `).join("");
  }

  totalEl.textContent = formatRupiah(getTotalPrice());
  validatePayment();
}

function validatePayment() {
  const total = getTotalPrice();
  const method = document.getElementById("paymentMethod").value;
  const cashInput = parseInt(document.getElementById("cashInput").value) || 0;
  const changeEl = document.getElementById("changeAmount");
  const btnCheckout = document.getElementById("btnCheckout");

  if (total === 0) {
    changeEl.textContent = "Rp 0";
    btnCheckout.disabled = true;
    return;
  }

  if (method === "Tunai") {
    const change = cashInput - total;
    changeEl.textContent = change >= 0 ? formatRupiah(change) : "Uang kurang";
    btnCheckout.disabled = cashInput < total;
  } else {
    changeEl.textContent = "Rp 0";
    btnCheckout.disabled = false;
  }
}

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter-btn.active").classList.remove("active");
    btn.classList.add("active");
    activeCategory = btn.dataset.category;
    renderProducts();
  });
});

document.getElementById("searchInput").addEventListener("input", (e) => {
  searchKeyword = e.target.value;
  renderProducts();
});

document.getElementById("paymentMethod").addEventListener("change", (e) => {
  const cashSection = document.getElementById("cashSection");
  cashSection.style.display = e.target.value === "Tunai" ? "block" : "none";
  validatePayment();
});

document.getElementById("cashInput").addEventListener("input", validatePayment);

document.getElementById("btnExactCash").addEventListener("click", () => {
  document.getElementById("cashInput").value = getTotalPrice();
  validatePayment();
});

document.querySelectorAll(".quick-btn[data-amount]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById("cashInput").value = btn.dataset.amount;
    validatePayment();
  });
});

document.getElementById("btnClearCart").addEventListener("click", () => {
  cart = [];
  document.getElementById("cashInput").value = "";
  updateCartUI();
});

document.getElementById("btnCheckout").addEventListener("click", () => {
  const total = getTotalPrice();
  const method = document.getElementById("paymentMethod").value;
  const cash = method === "Tunai" ? (parseInt(document.getElementById("cashInput").value) || 0) : total;
  const change = cash - total;
  const cashierName = currentUser ? currentUser.name : "Kasir";

  document.getElementById("receiptDate").textContent = new Date().toLocaleString("id-ID");
  document.getElementById("receiptCashier").textContent = "Kasir: " + cashierName;

  document.getElementById("receiptBody").innerHTML = cart.map(item => `
    <div class="receipt-line">
      <span>${item.name} (${item.qty}x)</span>
      <span>${formatRupiah(item.price * item.qty)}</span>
    </div>
  `).join("");

  document.getElementById("receiptFooter").innerHTML = `
    <div class="receipt-line"><strong>Total Bayar</strong><strong>${formatRupiah(total)}</strong></div>
    <div class="receipt-line"><span>Metode</span><span>${method}</span></div>
    <div class="receipt-line"><span>Dibayar</span><span>${formatRupiah(cash)}</span></div>
    <div class="receipt-line"><span>Kembalian</span><span>${formatRupiah(change)}</span></div>
  `;

  document.getElementById("receiptModal").classList.add("show");
});

document.getElementById("btnCopyReceipt").addEventListener("click", () => {
  const total = formatRupiah(getTotalPrice());
  const cashierName = currentUser ? currentUser.name : "Kasir";
  const itemsText = cart.map(i => `- ${i.name} (${i.qty}x): ${formatRupiah(i.price * i.qty)}`).join("\n");
  const text = `🌸 FLOWER SHOP AMELIA 🌸\nKasir: ${cashierName}\n${itemsText}\n--------------------\nTotal: ${total}\nTerima kasih telah berbelanja!`;

  navigator.clipboard.writeText(text);
  const btn = document.getElementById("btnCopyReceipt");
  btn.textContent = "Tersalin! ✓";
  setTimeout(() => btn.textContent = "Salin Struk", 2000);
});

document.getElementById("btnNewTransaction").addEventListener("click", () => {
  cart = [];
  document.getElementById("cashInput").value = "";
  document.getElementById("receiptModal").classList.remove("show");
  updateCartUI();
});

// Jalankan pengecekan login saat halaman dimuat
checkAuth();