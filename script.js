const ADMIN_PASSWORD = "123098484skdA";
let users = JSON.parse(localStorage.getItem("users") || "{}");
let codes = JSON.parse(localStorage.getItem("codes") || "{}");
let currentUser = null;

function saveData() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("codes", JSON.stringify(codes));
}

function registerUser() {
  const u = regUsername.value.trim(), p = regPassword.value.trim();
  if (!u || !p) return regMsg.innerText = "نام کاربری و رمز را وارد کنید";
  if (users[u]) return regMsg.innerText = "نام کاربری موجود است";
  users[u] = { password: p, balance: 0 }; saveData();
  regMsg.innerText = "ثبت نام موفق! حالا وارد شوید"; regUsername.value = regPassword.value = "";
}

function loginUser() {
  const u = loginUsername.value.trim(), p = loginPassword.value.trim();
  if (!users[u]) return loginMsg.innerText = "نام کاربری وجود ندارد";
  if (users[u].password !== p) return loginMsg.innerText = "رمز اشتباه";
  currentUser = u; loginSection.classList.add("hidden");
  userPanel.classList.remove("hidden"); currentUserName.innerText = u;
  updateBalance(); updateScoreTable();
}

function logout() {
  currentUser = null; userPanel.classList.add("hidden"); loginSection.classList.remove("hidden");
}

function updateBalance() {
  if (!currentUser) return;
  balanceDisplay.innerText = users[currentUser].balance + "$";
}

function redeemCode() {
  const code = userCode.value.trim();
  if (!codes[code]) return redeemMsg.innerText = "کد اشتباه یا استفاده شده";
  users[currentUser].balance += codes[code]; delete codes[code]; saveData();
  updateBalance(); redeemMsg.innerText = `شما ${codes[code]}$ دریافت کردید!`;
}

function transferDollar() {
  const to = transferTo.value.trim(), amount = parseInt(transferAmount.value);
  if (!users[to]) return transferMsg.innerText = "گیرنده وجود ندارد";
  if (users[currentUser].balance < amount) return transferMsg.innerText = "موجودی ناکافی";
  users[currentUser].balance -= amount; users[to].balance += amount; saveData();
  updateBalance(); updateScoreTable(); transferMsg.innerText = `منتقل شد: ${amount}$ به ${to}`;
}

function updateScoreTable() {
  const tbody = document.querySelector("#scoreTable tbody"); tbody.innerHTML = "";
  Object.entries(users).sort(([, a], [, b]) => b.balance - a.balance).forEach(([u, data], i) => {
    tbody.innerHTML += `<tr><td>${i+1}</td><td>${u}</td><td>${data.balance}$</td></tr>`;
  });
}

function loginAdmin() {
  if (adminPass.value !== ADMIN_PASSWORD) return adminMsg.innerText = "رمز اشتباه";
  adminLogin.classList.add("hidden"); adminPanel.classList.remove("hidden"); adminPass.value = "";
}

function logoutAdmin() {
  adminPanel.classList.add("hidden"); adminLogin.classList.remove("hidden");
}

function createCode() {
  const amount = parseInt(amountInput.value);
  if (!amount) return newCodeInfo.innerText = "مقدار معتبر وارد کنید";
  const code = [...Array(20)].map(()=>"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random()*62)]).join("");
  codes[code] = amount; saveData(); newCodeInfo.innerText = `کد: ${code} مقدار: ${amount}$`;
  QRCode.toCanvas(document.getElementById("qrCanvas"), code);
}
