// رمز مدیر پنل (مثال)
const ADMIN_PASSWORD = "12345admin";

// داده‌های ذخیره شده
let users = JSON.parse(localStorage.getItem("users") || "{}");
let codes = JSON.parse(localStorage.getItem("codes") || "{}");
let bannedUsers = JSON.parse(localStorage.getItem("bannedUsers") || "[]");
let currentUser = null;

// ذخیره داده‌ها در localStorage
function saveData() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("codes", JSON.stringify(codes));
  localStorage.setItem("bannedUsers", JSON.stringify(bannedUsers));
}

// ثبت نام
function register() {
  const u = document.getElementById("regUsername").value.trim();
  const p = document.getElementById("regPassword").value;
  const msg = document.getElementById("regMsg");
  msg.style.color = "#ff6f61";
  msg.innerText = "";

  if (!u || !p) {
    msg.innerText = "نام کاربری و رمز را وارد کنید";
    return;
  }
  if (users[u]) {
    msg.innerText = "نام کاربری قبلا ثبت شده است";
    return;
  }
  if (bannedUsers.includes(u)) {
    msg.innerText = "نام کاربری مسدود شده است";
    return;
  }
  users[u] = { password: p, balance: 0 };
  saveData();
  msg.style.color = "#7fff7f";
  msg.innerText = "ثبت نام با موفقیت انجام شد";
  document.getElementById("regUsername").value = "";
  document.getElementById("regPassword").value = "";
}

// ورود کاربر
function login() {
  const u = document.getElementById("loginUsername").value.trim();
  const p = document.getElementById("loginPassword").value;
  const msg = document.getElementById("loginMsg");
  msg.style.color = "#ff6f61";
  msg.innerText = "";

  if (!u || !p) {
    msg.innerText = "نام کاربری و رمز را وارد کنید";
    return;
  }
  if (bannedUsers.includes(u)) {
    msg.innerText = "این حساب مسدود شده است.";
    return;
  }
  if (!users[u] || users[u].password !== p) {
    msg.innerText = "نام کاربری یا رمز اشتباه است";
    return;
  }
  currentUser = u;
  document.getElementById("loginUsername").value = "";
  document.getElementById("loginPassword").value = "";
  msg.innerText = "";
  showUserPanel();
}

// نمایش پنل کاربری
function showUserPanel() {
  document.getElementById("userPanel").classList.remove("hidden");
  document.getElementById("registerSection").classList.add("hidden");
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("adminLogin").classList.add("hidden");
  document.getElementById("adminPanel").classList.add("hidden");

  document.getElementById("currentUserName").innerText = currentUser;
  updateBalanceDisplay();
  updateScoreTable();
}

// خروج کاربر
function logout() {
  currentUser = null;
  document.getElementById("userPanel").classList.add("hidden");
  document.getElementById("registerSection").classList.remove("hidden");
  document.getElementById("loginSection").classList.remove("hidden");
  document.getElementById("adminLogin").classList.remove("hidden");
}

// نمایش موجودی
function updateBalanceDisplay() {
  if (!currentUser) return;
  const bal = users[currentUser]?.balance || 0;
  document.getElementById("balanceDisplay").innerText = bal + "$";
}

// دریافت دلار با کد
function redeemCode() {
  const codeInput = document.getElementById("userCode").value.trim();
  const msg = document.getElementById("redeemMsg");
  msg.style.color = "#7fff7f";
  msg.innerText = "";

  if (!codeInput) {
    msg.style.color = "#ff6f61";
    msg.innerText = "لطفا کد را وارد کنید";
    return;
  }
  if (!codes[codeInput]) {
    msg.style.color = "#ff6f61";
    msg.innerText = "کد نامعتبر است یا قبلا استفاده شده";
    return;
  }
  if (codes[codeInput].used) {
    msg.style.color = "#ff6f61";
    msg.innerText = "این کد قبلا استفاده شده است";
    return;
  }
  const amount = codes[codeInput].amount || 0;
  users[currentUser].balance += amount;
  codes[codeInput].used = true;
  saveData();
  updateBalanceDisplay();
  msg.innerText = `با موفقیت ${amount}$ دریافت شد`;
  document.getElementById("userCode").value = "";
  updateScoreTable();
}

// انتقال دلار به کاربر دیگر
function transferDollar() {
  const toUser = document.getElementById("transferTo").value.trim();
  const amount = parseInt(document.getElementById("transferAmount").value.trim());
  const msg = document.getElementById("transferMsg");
  msg.style.color = "#7fff7f";
  msg.innerText = "";

  if (!toUser || !amount || amount <= 0) {
    msg.style.color = "#ff6f61";
    msg.innerText = "نام کاربری گیرنده و مقدار معتبر را وارد کنید";
    return;
  }
  if (!users[toUser]) {
    msg.style.color = "#ff6f61";
    msg.innerText = "کاربر گیرنده وجود ندارد";
    return;
  }
  if (users[currentUser].balance < amount) {
    msg.style.color = "#ff6f61";
    msg.innerText = "موجودی کافی ندارید";
    return;
  }
  users[currentUser].balance -= amount;
  users[toUser].balance += amount;
  saveData();
  updateBalanceDisplay();
  msg.innerText = `موفقیت آمیز! ${amount}$ به ${toUser} منتقل شد`;
  document.getElementById("transferTo").value = "";
  document.getElementById("transferAmount").value = "";
  updateScoreTable();
}

// جدول امتیازات ۱۰ نفر برتر
function updateScoreTable() {
  const tbody = document.querySelector("#scoreTable tbody");
  tbody.innerHTML = "";
  const sortedUsers = Object.keys(users)
    .filter(u => !bannedUsers.includes(u))
    .sort((a, b) => users[b].balance - users[a].balance)
    .slice(0, 10);

  sortedUsers.forEach((u, i) => {
    const tr = document.createElement("tr");
    const rankTd = document.createElement("td");
    rankTd.innerText = i + 1;
    const nameTd = document.createElement("td");
    nameTd.innerText = bannedUsers.includes(u) ? "حذف شده" : u;
    const balTd = document.createElement("td");
    balTd.innerText = users[u].balance + "$";

    tr.appendChild(rankTd);
    tr.appendChild(nameTd);
    tr.appendChild(balTd);
    tbody.appendChild(tr);
  });
}

// ورود پنل لیدر
function loginAdmin() {
  const pass = document.getElementById("adminPass").value;
  const msg = document.getElementById("adminMsg");
  if (pass === ADMIN_PASSWORD) {
    document.getElementById("adminLogin").classList.add("hidden");
    document.getElementById("adminPanel").classList.remove("hidden");
    msg.innerText = "";
    document.getElementById("adminPass").value = "";
  } else {
    msg.innerText = "رمز اشتباه است";
  }
}

// خروج از پنل لیدر
function logoutAdmin() {
  document.getElementById("adminPanel").classList.add("hidden");
  document.getElementById("adminLogin").classList.remove("hidden");
}

// ساخت کد جدید
function createCode() {
  const amount = parseInt(document.getElementById("amountInput").value.trim());
  const infoDiv = document.getElementById("newCodeInfo");
  infoDiv.innerText = "";
  const qrCanvas = document.getElementById("qrCanvas");
  qrCanvas.style.display = "none";

  if (!amount || amount <= 0) {
    infoDiv.style.color = "#ff6f61";
    infoDiv.innerText = "مقدار دلار معتبر وارد کنید";
    return;
  }
  // کد تصادفی 8 رقمی (ترکیبی از حروف و عدد)
  const newCode = Math.random().toString(36).slice(2, 10).toUpperCase();
  codes[newCode] = { amount: amount, used: false };
  saveData();

  infoDiv.style.color = "#7fff7f";
  infoDiv.innerText = `کد ساخته شد: ${newCode} (ارزش: ${amount}$)`;

  // ساخت QR Code
  QRCode.toCanvas(qrCanvas, newCode, { width: 180, color: { dark: "#6a5acd", light: "#fff" } }, function (error) {
    if (error) {
      infoDiv.innerText += "\nخطا در ساخت QR کد";
    } else {
      qrCanvas.style.display = "block";
    }
  });
  document.getElementById("amountInput").value = "";
}

// مسدودسازی کاربر (از پنل لیدر)
function banUserFromInput() {
  const username = document.getElementById("banUserInput").value.trim();
  const msg = document.getElementById("banUserMsg");
  msg.style.color = "#ff6f61
