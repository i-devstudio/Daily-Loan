// ==========================================
// APP STATE & CONFIGURATION
// ==========================================
let enteredPin = "";
let apiMode = false;
let apiUrl = "";

// Daily report states
let currentReportDate = "";
let activeReportTab = "unpaid";

// Current active cache
let appData = {
  settings: {
    defaultInterestPerDay: 100,
    defaultMinimumDays: 5,
    pinCode: "1234"
  },
  debtors: [],
  loans: [],
  payments: []
};

// Temporary storage for file uploads (Base64)
let tempUploadedFiles = {
  idcard: null,
  housereg: null,
  house: null,
  profile: null
};

// Active debtor details being viewed
let activeDebtorId = null;

// ==========================================
// MOCK DATA GENERATION (For immediate preview)
// ==========================================
const mockSettings = {
  defaultInterestPerDay: 50,
  defaultMinimumDays: 3,
  pinCode: "1234"
};

// ==========================================
// MOCK DATA — ชุดทดสอบ Case A / B / C
// (กู้ 2,000 ดอก 50/รอบ — ทดสอบยอดปิดบัญชี)
// ==========================================

const mockDebtors = [
  {
    // ─── เคส A: กู้ 2,000 ดอก 50 ขั้นต่ำ 3 รอบ ───
    // จ่าย 2 งวดแล้ว (ดอกสะสม 100) → ปิดยอดงวด 3
    // ดอกขั้นต่ำ = 150, ดอกที่เหลือ = 50 → ยอดปิด = 1,600 + max(50, 50) = ฿1,650
    debtorId: "debtor-a",
    fullName: "[A] นายสมชาย — ปิดยอดครบขั้นต่ำ",
    phone: "0811111111",
    nationalId: "1111111111111",
    address: "เคส A: กู้ 2,000 ดอก 50/รอบ ขั้นต่ำ 3 รอบ จ่าย 2 งวดแล้ว",
    occupation: "ทดสอบระบบ",
    facebook: "",
    lineId: "",
    googleMap: "",
    note: "ดอกสะสม 100 บาท (2 รอบ) / ดอกขั้นต่ำ 150 บาท (3 รอบ) → ยังขาดดอก 50 บาท\nยอดปิดยอดที่งวด 3 = 1,600 + max(50, 50) = ฿1,650",
    status: "active",
    idCardImage: "",
    houseRegistrationImage: "",
    houseImage: "",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    createdAt: "2026-06-01T08:00:00.000Z"
  },
  {
    // ─── เคส B: กู้ 2,000 ดอก 50 ขั้นต่ำ 4 รอบ ───
    // จ่าย 2 งวดแล้ว (ดอกสะสม 100) → ปิดยอดงวด 3 (ก่อนครบขั้นต่ำ)
    // ดอกขั้นต่ำ = 200, ดอกที่เหลือ = 100 → ยอดปิด = 1,600 + max(50, 100) = ฿1,700
    debtorId: "debtor-b",
    fullName: "[B] นางสาวมาลี — ปิดยอดก่อนครบขั้นต่ำ",
    phone: "0822222222",
    nationalId: "2222222222222",
    address: "เคส B: กู้ 2,000 ดอก 50/รอบ ขั้นต่ำ 4 รอบ จ่าย 2 งวดแล้ว",
    occupation: "ทดสอบระบบ",
    facebook: "",
    lineId: "",
    googleMap: "",
    note: "ดอกสะสม 100 บาท (2 รอบ) / ดอกขั้นต่ำ 200 บาท (4 รอบ) → ยังขาดดอก 100 บาท\nยอดปิดยอดที่งวด 3 = 1,600 + max(50, 100) = ฿1,700",
    status: "active",
    idCardImage: "",
    houseRegistrationImage: "",
    houseImage: "",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    createdAt: "2026-06-01T08:00:00.000Z"
  },
  {
    // ─── เคส C: กู้ 2,000 ดอก 50 ขั้นต่ำ 4 รอบ ───
    // จ่าย 5 งวดแล้ว (ดอกสะสม 250) → ปิดยอดงวด 6 (หลังครบขั้นต่ำ)
    // ดอกขั้นต่ำ = 200, ดอกสะสมจริง = 50 → ยอดปิด = 850 + max(50, 0) = ฿900
    debtorId: "debtor-c",
    fullName: "[C] นายวิชัย — ปิดยอดหลังครบขั้นต่ำ",
    phone: "0833333333",
    nationalId: "3333333333333",
    address: "เคส C: กู้ 2,000 ดอก 50/รอบ ขั้นต่ำ 4 รอบ จ่าย 5 งวดแล้ว",
    occupation: "ทดสอบระบบ",
    facebook: "",
    lineId: "",
    googleMap: "",
    note: "ดอกสะสม 250 บาท (5 รอบ) / ดอกขั้นต่ำ 200 บาท → ครบแล้ว\nยอดปิดยอดที่งวด 6 = 850 + max(50, 0) = ฿900",
    status: "active",
    idCardImage: "",
    houseRegistrationImage: "",
    houseImage: "",
    profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    createdAt: "2026-06-01T08:00:00.000Z"
  }
];

const mockLoans = [
  {
    // เคส A: กู้ 2,000 ดอก 50 ขั้นต่ำ 3 รอบ — จ่าย 2 งวด → เหลือต้น 1,600
    loanId: "loan-a",
    debtorId: "debtor-a",
    loanDate: "2026-06-01",
    contractStartDate: "2026-06-01",
    paymentFrequency: "daily",
    principal: 2000,
    remainingPrincipal: 1600,
    interestPerDay: 50,
    minimumDays: 3,
    status: "active",
    createdAt: "2026-06-01T08:00:00.000Z"
  },
  {
    // เคส B: กู้ 2,000 ดอก 50 ขั้นต่ำ 4 รอบ — จ่าย 2 งวด → เหลือต้น 1,600
    loanId: "loan-b",
    debtorId: "debtor-b",
    loanDate: "2026-06-01",
    contractStartDate: "2026-06-01",
    paymentFrequency: "daily",
    principal: 2000,
    remainingPrincipal: 1600,
    interestPerDay: 50,
    minimumDays: 4,
    status: "active",
    createdAt: "2026-06-01T08:00:00.000Z"
  },
  {
    // เคส C: กู้ 2,000 ดอก 50 ขั้นต่ำ 4 รอบ — จ่าย 5 งวด → เหลือต้น 850
    loanId: "loan-c",
    debtorId: "debtor-c",
    loanDate: "2026-06-01",
    contractStartDate: "2026-06-01",
    paymentFrequency: "daily",
    principal: 2000,
    remainingPrincipal: 850,
    interestPerDay: 50,
    minimumDays: 4,
    status: "active",
    createdAt: "2026-06-01T08:00:00.000Z"
  }
];

const mockPayments = [
  // ─── เคส A: 2 งวด ───
  {
    // งวด 1: จ่าย 200 → หักดอก 50, หักต้น 150 → เหลือต้น 1,850
    paymentId: "pay-a1",
    loanId: "loan-a",
    paymentDate: "2026-06-02 10:00:00",
    amount: 200,
    interestPaid: 50,
    principalPaid: 150,
    remainingPrincipal: 1850,
    createdAt: "2026-06-02T03:00:00.000Z"
  },
  {
    // งวด 2: จ่าย 300 → หักดอก 50, หักต้น 250 → เหลือต้น 1,600
    paymentId: "pay-a2",
    loanId: "loan-a",
    paymentDate: "2026-06-03 10:00:00",
    amount: 300,
    interestPaid: 50,
    principalPaid: 250,
    remainingPrincipal: 1600,
    createdAt: "2026-06-03T03:00:00.000Z"
  },
  // ─── เคส B: 2 งวด ───
  {
    // งวด 1: จ่าย 200 → หักดอก 50, หักต้น 150 → เหลือต้น 1,850
    paymentId: "pay-b1",
    loanId: "loan-b",
    paymentDate: "2026-06-02 10:00:00",
    amount: 200,
    interestPaid: 50,
    principalPaid: 150,
    remainingPrincipal: 1850,
    createdAt: "2026-06-02T03:00:00.000Z"
  },
  {
    // งวด 2: จ่าย 300 → หักดอก 50, หักต้น 250 → เหลือต้น 1,600
    paymentId: "pay-b2",
    loanId: "loan-b",
    paymentDate: "2026-06-03 10:00:00",
    amount: 300,
    interestPaid: 50,
    principalPaid: 250,
    remainingPrincipal: 1600,
    createdAt: "2026-06-03T03:00:00.000Z"
  },
  // ─── เคส C: 5 งวด ───
  {
    // งวด 1: จ่าย 200 → หักดอก 50, หักต้น 150 → เหลือต้น 1,850
    paymentId: "pay-c1",
    loanId: "loan-c",
    paymentDate: "2026-06-02 10:00:00",
    amount: 200,
    interestPaid: 50,
    principalPaid: 150,
    remainingPrincipal: 1850,
    createdAt: "2026-06-02T03:00:00.000Z"
  },
  {
    // งวด 2: จ่าย 300 → หักดอก 50, หักต้น 250 → เหลือต้น 1,600
    paymentId: "pay-c2",
    loanId: "loan-c",
    paymentDate: "2026-06-03 10:00:00",
    amount: 300,
    interestPaid: 50,
    principalPaid: 250,
    remainingPrincipal: 1600,
    createdAt: "2026-06-03T03:00:00.000Z"
  },
  {
    // งวด 3: จ่าย 300 → หักดอก 50, หักต้น 250 → เหลือต้น 1,350
    paymentId: "pay-c3",
    loanId: "loan-c",
    paymentDate: "2026-06-04 10:00:00",
    amount: 300,
    interestPaid: 50,
    principalPaid: 250,
    remainingPrincipal: 1350,
    createdAt: "2026-06-04T03:00:00.000Z"
  },
  {
    // งวด 4: จ่าย 300 → หักดอก 50, หักต้น 250 → เหลือต้น 1,100
    paymentId: "pay-c4",
    loanId: "loan-c",
    paymentDate: "2026-06-05 10:00:00",
    amount: 300,
    interestPaid: 50,
    principalPaid: 250,
    remainingPrincipal: 1100,
    createdAt: "2026-06-05T03:00:00.000Z"
  },
  {
    // งวด 5: จ่าย 300 → หักดอก 50, หักต้น 250 → เหลือต้น 850
    paymentId: "pay-c5",
    loanId: "loan-c",
    paymentDate: "2026-06-06 10:00:00",
    amount: 300,
    interestPaid: 50,
    principalPaid: 250,
    remainingPrincipal: 850,
    createdAt: "2026-06-06T03:00:00.000Z"
  }
];

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Check if API Connection details exist
  apiUrl = localStorage.getItem("df_api_url") || "";
  
  // Set default report date to today
  currentReportDate = formatDateStr(new Date());
  const reportDateEl = document.getElementById("report-date");
  if (reportDateEl) {
    reportDateEl.value = currentReportDate;
  }
  
  if (apiUrl) {
    apiMode = true;
    const badge = document.getElementById("db-connection-badge");
    badge.innerText = "API Connected";
    badge.className = "mode-badge mode-api";
  } else {
    // Load mock data into appData cache
    loadMockData();
  }

  // Load defaults in UI input boxes
  initSettingsInputs();

  // Check login state
  const isLoggedIn = sessionStorage.getItem("df_logged_in") === "true";
  if (isLoggedIn) {
    document.getElementById("login-page").style.display = "none";
    refreshData();
  }
});

function loadMockData() {
  appData.settings = JSON.parse(localStorage.getItem("df_settings")) || { ...mockSettings };
  appData.debtors = JSON.parse(localStorage.getItem("df_debtors")) || [ ...mockDebtors ];
  appData.loans = JSON.parse(localStorage.getItem("df_loans")) || [ ...mockLoans ];
  appData.payments = JSON.parse(localStorage.getItem("df_payments")) || [ ...mockPayments ];
  
  // Save mock data locally to simulate persistence
  saveLocalCache();
}

function saveLocalCache() {
  if (!apiMode) {
    localStorage.setItem("df_settings", JSON.stringify(appData.settings));
    localStorage.setItem("df_debtors", JSON.stringify(appData.debtors));
    localStorage.setItem("df_loans", JSON.stringify(appData.loans));
    localStorage.setItem("df_payments", JSON.stringify(appData.payments));
  }
}

// ─── โหมดทดสอบ: ล้าง localStorage และโหลด Mock Data ชุด A/B/C ใหม่ทั้งหมด ───
function resetToMockData() {
  if (!confirm("⚠️ รีเซ็ตข้อมูลทั้งหมดและโหลด Mock Data ชุดทดสอบ A/B/C ใหม่?\n\nข้อมูลที่บันทึกไว้ทั้งหมดจะถูกลบออก")) return;
  
  localStorage.removeItem("df_settings");
  localStorage.removeItem("df_debtors");
  localStorage.removeItem("df_loans");
  localStorage.removeItem("df_payments");
  
  appData.settings = { ...mockSettings };
  appData.debtors = [ ...mockDebtors ];
  appData.loans = [ ...mockLoans ];
  appData.payments = [ ...mockPayments ];
  
  saveLocalCache();
  refreshData();
  showToast("✅ รีเซ็ต Mock Data สำเร็จ — โหลดชุดทดสอบ A/B/C แล้ว", "success");
}

function initSettingsInputs() {
  document.getElementById("set-default-interest").value = appData.settings.defaultInterestPerDay;
  document.getElementById("set-default-min-days").value = appData.settings.defaultMinimumDays;
  document.getElementById("set-api-url").value = apiUrl;
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const text = document.getElementById("toast-text");
  const icon = document.getElementById("toast-icon");
  
  toast.className = `toast show toast-${type}`;
  text.innerText = message;
  
  if (type === "success") {
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === "danger") {
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else {
    icon.innerHTML = "";
  }
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ==========================================
// PIN LOGIN LOGIC
// ==========================================
function pressPin(num) {
  if (enteredPin.length < 4) {
    enteredPin += num;
    updatePinDots();
    
    if (enteredPin.length === 4) {
      // Small delay for animation
      setTimeout(verifyPin, 200);
    }
  }
}

function clearPin() {
  enteredPin = "";
  updatePinDots();
}

function backspacePin() {
  enteredPin = enteredPin.slice(0, -1);
  updatePinDots();
}

function updatePinDots() {
  for (let i = 1; i <= 4; i++) {
    const dot = document.getElementById(`dot-${i}`);
    if (i <= enteredPin.length) {
      dot.classList.add("filled");
    } else {
      dot.classList.remove("filled");
    }
  }
}

async function verifyPin() {
  showLoading("กำลังตรวจสอบรหัส PIN...");
  
  try {
    if (apiMode) {
      // Call Apps Script API to verify PIN
      const res = await callApi("login", { pin: enteredPin });
      hideLoading();
      
      if (res && res.success) {
        sessionStorage.setItem("df_logged_in", "true");
        document.getElementById("login-page").style.display = "none";
        showToast("ยินดีต้อนรับเข้าสู่ระบบ");
        refreshData();
      } else {
        showToast("รหัส PIN ไม่ถูกต้อง", "danger");
        clearPin();
      }
    } else {
      // Verify with Mock Settings / Local Settings
      hideLoading();
      if (enteredPin === appData.settings.pinCode) {
        sessionStorage.setItem("df_logged_in", "true");
        document.getElementById("login-page").style.display = "none";
        showToast("ยินดีต้อนรับเข้าสู่ระบบ (Mock Mode)");
        refreshData();
      } else {
        showToast("รหัส PIN ไม่ถูกต้อง", "danger");
        clearPin();
      }
    }
  } catch (err) {
    hideLoading();
    showToast("เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์", "danger");
    clearPin();
  }
}

function logout() {
  sessionStorage.removeItem("df_logged_in");
  enteredPin = "";
  updatePinDots();
  document.getElementById("login-page").style.display = "flex";
  switchTab("dashboard");
}

// ==========================================
// NAVIGATION (TAB ROUTER)
// ==========================================
function switchTab(tabId) {
  // Hide all pages
  const pages = document.querySelectorAll(".app-page");
  pages.forEach(page => page.classList.remove("active"));
  
  // Show target page
  const targetPage = document.getElementById(`${tabId}-page`);
  if (targetPage) {
    targetPage.classList.add("active");
  }
  
  // Manage Bottom Nav Active Classes dynamically
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    item.classList.remove("active");
    const onclickAttr = item.getAttribute("onclick");
    if (onclickAttr && onclickAttr.includes(`'${tabId}'`)) {
      item.classList.add("active");
    }
  });

  // Action triggers for specific tabs
  if (tabId === "payments") {
    renderPaymentsList();
  } else if (tabId === "overdue") {
    renderOverdueList();
  }
  
  // Manage Main FAB visibility (visible on Dashboard, Debtors, Payments, and Overdue list)
  const fab = document.getElementById("main-fab");
  if (tabId === "dashboard" || tabId === "debtors" || tabId === "payments" || tabId === "overdue") {
    fab.classList.remove("hidden");
  } else {
    fab.classList.add("hidden");
  }
}

function switchDetailTab(subTabId) {
  const detailTabs = document.querySelectorAll(".tab-btn");
  detailTabs.forEach(tab => tab.classList.remove("active"));
  
  const detailContents = document.querySelectorAll(".tab-content");
  detailContents.forEach(content => content.classList.remove("active"));
  
  // Set target tab active
  event.target.classList.add("active");
  document.getElementById(`detail-tab-${subTabId}`).classList.add("active");
}

function goBackToDebtors() {
  switchTab("debtors");
}

// ==========================================
// MODALS / BOTTOM SHEET CONTROL
// ==========================================
function openSheet(sheetId) {
  document.getElementById(sheetId).classList.add("active");
}

function closeSheet(sheetId) {
  document.getElementById(sheetId).classList.remove("active");
  
  // If closing add-debtor, clear input forms and file preview
  if (sheetId === "add-debtor-sheet") {
    document.getElementById("add-debtor-form").reset();
    clearFilePreviews();
  }
  
  // If closing payment sheet, reset form
  if (sheetId === "payment-sheet") {
    document.getElementById("payment-form").reset();
    calculatePaymentPreview(0);
  }
}

// ==========================================
// REFRESH DATA (REAL-TIME OR LOCAL CACHE)
// ==========================================
async function refreshData() {
  showLoading("กำลังโหลดข้อมูลล่าสุด...");
  try {
    if (apiMode) {
      const res = await callApi("getInitialData", {});
      if (res && res.success) {
        appData.settings = res.data.settings;
        appData.debtors = res.data.debtors;
        appData.loans = res.data.loans;
        appData.payments = res.data.payments;
        
        // Update input placeholders
        initSettingsInputs();
      }
    }
    
    // Render views
    renderDashboard();
    renderDebtorsList();
    renderPaymentsList();
    renderOverdueList();
    
    // If details page is open, refresh it
    if (activeDebtorId) {
      renderDebtorDetails(activeDebtorId);
    }
  } catch (err) {
    showToast("ไม่สามารถโหลดข้อมูลจาก API ได้ (กำลังใช้โหมดจำลองแทน)", "danger");
    console.error("API error, fallback to local:", err);
  } finally {
    hideLoading();
  }
}

// ==========================================
// MODULE 1: DASHBOARD RENDERING
// ==========================================
function renderDashboard() {
  // Filter active loans with outstanding balance
  const activeLoans = appData.loans.filter(l => l.status === "active" && l.remainingPrincipal > 0);
  
  // Stat 1: Total active debtors count who have not closed their debt
  // Use same method as Tab: count debtors in debtors array that have an active loan
  const activeDebtorIds = new Set(activeLoans.map(l => l.debtorId));
  const activeDebtorCount = appData.debtors.filter(d => activeDebtorIds.has(d.debtorId)).length;
  document.getElementById("stat-total-debtors").innerText = `${activeDebtorCount} คน`;
  
  // Stat 2: Total remaining principal
  const totalPrincipal = activeLoans.reduce((sum, loan) => sum + parseFloat(loan.remainingPrincipal || 0), 0);
  document.getElementById("stat-total-principal").innerText = `฿${totalPrincipal.toLocaleString()}`;
  
  // Calculations for Today's and Month's payments
  const now = new Date();
  const todayStr = formatDateStr(now); // YYYY-MM-DD
  const thisMonthPrefix = todayStr.substring(0, 7); // YYYY-MM
  
  let todaySum = 0;
  let monthSum = 0;
  
  appData.payments.forEach(p => {
    if (p.paymentDate) {
      const pDateOnly = p.paymentDate.split(" ")[0]; // YYYY-MM-DD
      if (pDateOnly === todayStr) {
        todaySum += parseFloat(p.amount || 0);
      }
      if (pDateOnly.startsWith(thisMonthPrefix)) {
        monthSum += parseFloat(p.amount || 0);
      }
    }
  });
  
  document.getElementById("stat-today-received").innerText = `฿${todaySum.toLocaleString()}`;
  document.getElementById("stat-month-received").innerText = `฿${monthSum.toLocaleString()}`;
  
  // Render Recent Debtors (Show top 3 recently added active debtors)
  const recentDebtorsContainer = document.getElementById("recent-debtors-list");
  
  // Get active debtors sorted by createdAt desc
  const activeDebtors = appData.debtors
    .filter(d => d.status === "active")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);
    
  if (activeDebtors.length === 0) {
    recentDebtorsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <div class="empty-state-title">ไม่มีข้อมูลลูกหนี้</div>
        <div class="empty-state-desc">กดปุ่ม + ด้านล่างขวาเพื่อเพิ่มลูกหนี้คนแรก</div>
      </div>
    `;
    return;
  }
  
  let html = "";
  activeDebtors.forEach(debtor => {
    const loan = appData.loans.find(l => l.debtorId === debtor.debtorId && l.status === "active");
    if (loan) {
      html += createDebtorCardHtml(debtor, loan);
    }
  });
  recentDebtorsContainer.innerHTML = html;

  // Render Daily Report status
  renderDailyReport();
}

// ==========================================
// MODULE 1.5: DAILY COLLECTION STATUS REPORT
// ==========================================
function renderDailyReport() {
  const container = document.getElementById("report-list-container");
  if (!container) return;
  
  // Find all loans that were active on the currentReportDate
  const activeLoansOnDate = appData.loans.filter(loan => {
    // If loan was created after the report date, it wasn't active yet
    if (loan.loanDate > currentReportDate) return false;
    
    // If it is active, it is currently active
    if (loan.status === "active") return true;
    
    // If it was completed, check if the completion date (date of last payment) was on or after report date
    if (loan.status === "completed") {
      const finalPay = appData.payments.find(p => p.loanId === loan.loanId && parseFloat(p.remainingPrincipal) === 0);
      if (finalPay) {
        const finalPayDate = finalPay.paymentDate.split(" ")[0]; // YYYY-MM-DD
        return finalPayDate >= currentReportDate;
      }
      return true; // Fallback
    }
    return false;
  });
  
  const paidList = [];
  const unpaidList = [];
  
  activeLoansOnDate.forEach(loan => {
    const debtor = appData.debtors.find(d => d.debtorId === loan.debtorId);
    if (!debtor) return;
    
    // Find payments made on this date for this loan
    const dayPayments = appData.payments.filter(p => p.loanId === loan.loanId && p.paymentDate.split(" ")[0] === currentReportDate);
    const totalPaidOnDay = dayPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    if (totalPaidOnDay > 0) {
      paidList.push({
        debtor,
        loan,
        amountPaid: totalPaidOnDay
      });
    } else {
      // Only add to unpaid list if the loan is still active (not completed)
      if (loan.status !== "completed") {
        unpaidList.push({
          debtor,
          loan
        });
      }
    }
  });
  
  // Update UI stats
  const totalCount = paidList.length + unpaidList.length;
  const paidCount = paidList.length;
  const progressPercent = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
  
  document.getElementById("report-progress").innerText = `${paidCount}/${totalCount} คน`;
  document.getElementById("report-percent").innerText = `${Math.round(progressPercent)}%`;
  document.getElementById("report-progress-bar").style.width = `${progressPercent}%`;
  
  document.getElementById("count-report-unpaid").innerText = unpaidList.length;
  document.getElementById("count-report-paid").innerText = paidList.length;
  
  // Render list based on active tab
  let html = "";
  if (activeReportTab === "unpaid") {
    if (unpaidList.length === 0) {
      html = `<div style="text-align:center; padding:12px; font-size:12px; color:var(--color-text-secondary);">🎉 ทุกคนจ่ายครบหมดแล้ววันนี้!</div>`;
    } else {
      unpaidList.sort((a,b) => a.debtor.fullName.localeCompare(b.debtor.fullName, 'th'));
      unpaidList.forEach(item => {
        const avatarStyle = getAvatarHtml(item.debtor.profileImage, "width:32px; height:32px; font-size:12px; flex-shrink: 0;");
        const avatarContent = getAvatarContent(item.debtor.profileImage);
        
        html += `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #F3F4F6;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div class="debtor-avatar" ${avatarStyle}>
                ${avatarContent}
              </div>
              <div>
                <div style="font-size:13px; font-weight:600; color:var(--color-text);">${item.debtor.fullName}</div>
                <div style="font-size:11px; color:var(--color-text-secondary);">ค้างต้น: ฿${parseFloat(item.loan.remainingPrincipal).toLocaleString()} | ดอก: ฿${parseFloat(item.loan.interestPerDay).toLocaleString()}</div>
              </div>
            </div>
            <button class="btn btn-primary" onclick="openReceivePaymentModal('${item.loan.loanId}', '${item.debtor.debtorId}')" style="height:32px; font-size:11px; padding:0 8px; border-radius:8px; width:auto; flex:none;">
              รับเงิน
            </button>
          </div>
        `;
      });
    }
  } else {
    if (paidList.length === 0) {
      html = `<div style="text-align:center; padding:12px; font-size:12px; color:var(--color-text-secondary);">ยังไม่มีใครจ่ายเงินในวันที่เลือก</div>`;
    } else {
      paidList.sort((a,b) => a.debtor.fullName.localeCompare(b.debtor.fullName, 'th'));
      paidList.forEach(item => {
        const avatarStyle = getAvatarHtml(item.debtor.profileImage, "width:32px; height:32px; font-size:12px; flex-shrink: 0;");
        const avatarContent = getAvatarContent(item.debtor.profileImage);
        
        html += `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #F3F4F6;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div class="debtor-avatar" ${avatarStyle}>
                ${avatarContent}
              </div>
              <div>
                <div style="font-size:13px; font-weight:600; color:var(--color-text);">${item.debtor.fullName}</div>
                <div style="font-size:11px; color:var(--color-text-secondary);">${formatPhone(item.debtor.phone)}</div>
              </div>
            </div>
            <div style="text-align:right;">
              <span class="text-success" style="font-size:13px; font-weight:700;">+฿${item.amountPaid.toLocaleString()}</span>
              <div style="font-size:10px; color:var(--color-text-secondary);">ชำระแล้ว</div>
            </div>
          </div>
        `;
      });
    }
  }
  
  container.innerHTML = html;
}

function switchReportTab(tabId) {
  activeReportTab = tabId;
  
  const btnUnpaid = document.getElementById("btn-report-unpaid");
  const btnPaid = document.getElementById("btn-report-paid");
  
  if (tabId === "unpaid") {
    btnUnpaid.classList.add("active");
    btnPaid.classList.remove("active");
  } else {
    btnUnpaid.classList.remove("active");
    btnPaid.classList.add("active");
  }
  
  renderDailyReport();
}

function handleReportDateChange(val) {
  if (val) {
    currentReportDate = val;
    renderDailyReport();
  }
}

// Helper to create Debtor Card HTML
function createDebtorCardHtml(debtor, loan) {
  const avatarStyle = getAvatarHtml(debtor.profileImage);
  const avatarContent = getAvatarContent(debtor.profileImage);
  
  // Calculate overdue status
  const overdueInfo = getLoanOverdueInfo(loan);
  
  let badgeClass = debtor.status === 'active' ? 'status-active' : 'status-closed';
  let badgeText = debtor.status === 'active' ? 'ปกติ' : 'ปิดยอดแล้ว';
  let badgeStyle = "";

  if (debtor.status === 'active' && overdueInfo.isOverdue) {
    badgeClass = "";
    badgeText = `เกินชำระ ${overdueInfo.overdueDays} ${getFrequencyUnitName(loan.paymentFrequency)}`;
    badgeStyle = `background-color: #FEE2E2; color: #EF4444; border: 1px solid #FCA5A5;`;
  }
  
  return `
    <div class="card debtor-card" onclick="viewDebtorDetails('${debtor.debtorId}')" style="border-radius: 0; ${overdueInfo.isOverdue ? 'border-left: 4px solid var(--color-danger);' : ''}">
      <div class="debtor-card-header">
        <div class="debtor-name-container">
          <div class="debtor-avatar" ${avatarStyle}>
            ${avatarContent}
          </div>
          <div>
            <div class="debtor-name">${debtor.fullName}</div>
            <div class="debtor-phone">${formatPhone(debtor.phone)}</div>
          </div>
        </div>
        <span class="status-badge ${badgeClass}" style="${badgeStyle}">
          ${badgeText}
        </span>
      </div>
      
      <div class="debtor-card-body" style="border-radius: 0; ${overdueInfo.isOverdue ? 'background-color: #FEF2F2;' : ''}">
        <div class="info-item">
          <span class="info-label">เงินต้นคงเหลือ</span>
          <span class="info-value text-danger">฿${parseFloat(loan.remainingPrincipal).toLocaleString()}</span>
        </div>
        <div class="info-item">
          <span class="info-label">${getFrequencyInterestLabel(loan.paymentFrequency)}</span>
          <span class="info-value">฿${loan.status === 'completed' || debtor.status === 'closed' ? '0' : parseFloat(loan.interestPerDay).toLocaleString()}</span>
        </div>
        ${overdueInfo.isOverdue ? `
          <div class="info-item" style="grid-column: span 2; margin-top: 6px; border-top: 1px dashed #FCA5A5; padding-top: 6px; display: flex; flex-direction: row; justify-content: space-between;">
            <span class="info-label" style="color: #991B1B; font-weight: 600;">ดอกสะสม (ทบดอก):</span>
            <span class="info-value" style="color: #EF4444; font-weight: 700;">฿${parseFloat(overdueInfo.outstandingInterest).toLocaleString()}</span>
          </div>
        ` : ""}
      </div>
      
      <div class="debtor-card-actions" onclick="event.stopPropagation();">
        <button class="btn btn-secondary" onclick="viewDebtorDetails('${debtor.debtorId}')" style="border-radius: 0;">รายละเอียด</button>
        ${loan.remainingPrincipal > 0 ? `
          <button class="btn btn-primary" onclick="openReceivePaymentModal('${loan.loanId}', '${debtor.debtorId}')" style="border-radius: 0; ${overdueInfo.isOverdue ? 'background-color: #EF4444; border-color: #EF4444;' : ''}">
            รับเงิน
          </button>
        ` : ""}
      </div>
    </div>
  `;
}

// Helper to create Debtor Compact (Thin Row) HTML
function createDebtorCompactHtml(debtor, loan) {
  const avatarStyle = getAvatarHtml(debtor.profileImage, "width: 36px; height: 36px; font-size: 12px; flex-shrink: 0;");
  const avatarContent = getAvatarContent(debtor.profileImage);
  
  // Calculate overdue status
  const overdueInfo = getLoanOverdueInfo(loan);
  
  let statusBadgeHtml = "";
  if (debtor.status === "closed") {
    statusBadgeHtml = `<span class="status-badge status-closed" style="padding: 2px 6px; font-size: 10px;">ปิดยอด</span>`;
  } else if (overdueInfo.isOverdue) {
    statusBadgeHtml = `<span class="status-badge" style="background-color: #FEE2E2; color: #EF4444; border: 1px solid #FCA5A5; padding: 2px 6px; font-size: 10px;">เกินชำระ ${overdueInfo.overdueDays} ${getFrequencyUnitName(loan.paymentFrequency)}</span>`;
  } else {
    statusBadgeHtml = `<span class="status-badge status-active" style="padding: 2px 6px; font-size: 10px;">ปกติ</span>`;
  }

  return `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background-color: var(--color-card); border-bottom: 1px solid #E5E7EB; cursor: pointer; transition: background 0.2s;" onclick="viewDebtorDetails('${debtor.debtorId}')" class="compact-debtor-row">
      <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
        <div class="debtor-avatar" ${avatarStyle}>
          ${avatarContent}
        </div>
        <div style="min-width: 0; flex: 1;">
          <div style="font-weight: 600; font-size: 14px; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${debtor.fullName}</div>
          <div style="font-size: 11px; color: var(--color-text-secondary); display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
            <span>ต้น: ฿${parseFloat(loan.remainingPrincipal).toLocaleString()}</span>
            <span style="color: #D1D5DB;">|</span>
            <span>ดอก/${getFrequencyUnitName(loan.paymentFrequency)}: ฿${loan.status === 'completed' || debtor.status === 'closed' ? '0' : parseFloat(loan.interestPerDay).toLocaleString()}</span>
            ${overdueInfo.isOverdue ? `<span style="color: #D1D5DB;">|</span><span style="color: #EF4444; font-weight: 600;">ค้าง: ฿${overdueInfo.outstandingInterest.toLocaleString()}</span>` : ""}
          </div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; margin-left: 8px; flex-shrink: 0;">
        ${statusBadgeHtml}
        ${loan.remainingPrincipal > 0 ? `
          <button class="btn btn-primary" onclick="event.stopPropagation(); openReceivePaymentModal('${loan.loanId}', '${debtor.debtorId}')" style="height: 32px; font-size: 11px; padding: 0 10px; width: auto; flex: none; border-radius: 0;">
            รับเงิน
          </button>
        ` : ""}
      </div>
    </div>
  `;
}

// ==========================================
// MODULE 2: DEBTORS LIST & SEARCH
// ==========================================
let currentSearchQuery = "";
let debtorFilterStatus = "all"; // "all", "active", "closed"
let debtorViewLayout = "compact"; // "compact" or "card"

function switchDebtorFilter(status) {
  debtorFilterStatus = status;
  
  // Update tabs visual state
  const tabs = ["all", "active", "closed"];
  tabs.forEach(t => {
    const btn = document.getElementById(`btn-debtor-${t}`);
    if (btn) {
      if (t === status) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
  });
  
  renderDebtorsList();
}

function toggleDebtorsLayout() {
  debtorViewLayout = debtorViewLayout === "compact" ? "card" : "compact";
  renderDebtorsList();
}

function renderDebtorsList() {
  const debtorsContainer = document.getElementById("debtors-list");
  if (!debtorsContainer) return;
  
  // Find unique debtor IDs with active loans (outstanding balance > 0)
  const activeDebtorIds = new Set(appData.loans.filter(l => l.status === "active" && l.remainingPrincipal > 0).map(l => l.debtorId));
  
  // Update debtor tab counts dynamically
  const countAll = appData.debtors.length;
  const countActive = appData.debtors.filter(d => activeDebtorIds.has(d.debtorId)).length;
  const countClosed = countAll - countActive;
  
  const btnAll = document.getElementById("btn-debtor-all");
  const btnActive = document.getElementById("btn-debtor-active");
  const btnClosed = document.getElementById("btn-debtor-closed");
  
  if (btnAll) btnAll.innerText = `ทั้งหมด (${countAll})`;
  if (btnActive) btnActive.innerText = `กำลังกู้ (${countActive})`;
  if (btnClosed) btnClosed.innerText = `ปิดยอดแล้ว (${countClosed})`;
  
  // 1. Filter by search query
  let filteredDebtors = appData.debtors;
  
  if (currentSearchQuery.trim() !== "") {
    const q = currentSearchQuery.toLowerCase().trim().replace(/[-\s]/g, "");
    filteredDebtors = filteredDebtors.filter(d => {
      const name = d.fullName.toLowerCase().replace(/\s/g, "");
      const phone = d.phone.replace(/[-\s]/g, "");
      return name.includes(q) || phone.includes(q);
    });
  }
  
  // 2. Filter by status tab
  if (debtorFilterStatus === "active") {
    filteredDebtors = filteredDebtors.filter(d => activeDebtorIds.has(d.debtorId));
  } else if (debtorFilterStatus === "closed") {
    filteredDebtors = filteredDebtors.filter(d => !activeDebtorIds.has(d.debtorId));
  }
  
  // Sort: Active debtors first (only relevant if 'all' is selected), then sorted by name
  filteredDebtors.sort((a, b) => {
    if (debtorFilterStatus === "all") {
      const aActive = activeDebtorIds.has(a.debtorId);
      const bActive = activeDebtorIds.has(b.debtorId);
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
    }
    return a.fullName.localeCompare(b.fullName, 'th');
  });

  // Toggle layout icon dynamically
  const toggleIcon = document.getElementById("layout-toggle-icon");
  if (toggleIcon) {
    if (debtorViewLayout === "compact") {
      // Show card view icon (grid layout represent)
      toggleIcon.innerHTML = `<rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect>`;
    } else {
      // Show list view icon (thin list represent)
      toggleIcon.innerHTML = `<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>`;
    }
  }

  if (filteredDebtors.length === 0) {
    debtorsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">ไม่พบรายชื่อลูกหนี้</div>
        <div class="empty-state-desc">ลองค้นหาด้วยคำอื่น หรือเปลี่ยนประเภทฟิลเตอร์</div>
      </div>
    `;
    return;
  }
  
  let html = "";
  
  // In compact layout, wrap in a container with white background
  if (debtorViewLayout === "compact") {
    html += `<div style="background-color: var(--color-card); border: 1px solid #E5E7EB; display: flex; flex-direction: column;">`;
  }
  
  filteredDebtors.forEach(debtor => {
    // Find active loan first, if closed/none find completed loan
    let loan = appData.loans.find(l => l.debtorId === debtor.debtorId && l.status === "active");
    if (!loan) {
      loan = appData.loans.filter(l => l.debtorId === debtor.debtorId)
             .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    }
    
    // In case no loan record exists at all
    if (!loan) {
      loan = { remainingPrincipal: 0, interestPerDay: 0, status: "completed" };
    }
    
    if (debtorViewLayout === "compact") {
      html += createDebtorCompactHtml(debtor, loan);
    } else {
      html += createDebtorCardHtml(debtor, loan);
    }
  });
  
  if (debtorViewLayout === "compact") {
    html += `</div>`;
  }
  
  debtorsContainer.innerHTML = html;
}

function handleSearch(val) {
  currentSearchQuery = val;
  renderDebtorsList();
}

// ==========================================
// MODULE 2.5: PAYMENTS LIST & SEARCH (ACTIVE ONLY)
// ==========================================
let currentPaymentsSearchQuery = "";
let currentPaymentsFilter = "unpaid"; // "unpaid", "paid", "all"
let paymentsViewLayout = "compact"; // "compact" or "card"

function togglePaymentsLayout() {
  paymentsViewLayout = paymentsViewLayout === "compact" ? "card" : "compact";
  renderPaymentsList();
}

function switchPaymentsFilter(filterId) {
  currentPaymentsFilter = filterId;
  
  // Update active class on tabs
  const tabs = ["unpaid", "paid", "all"];
  tabs.forEach(t => {
    const btn = document.getElementById(`btn-pay-${t}`);
    if (btn) {
      if (t === filterId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
  });
  
  renderPaymentsList();
}

function renderPaymentsList() {
  const container = document.getElementById("payments-active-list");
  if (!container) return;
  
  // Find all loans that were active on the currentReportDate
  const activeLoans = appData.loans.filter(loan => {
    if (loan.loanDate > currentReportDate) return false;
    
    // If a payment was made on this date, we must include it so it shows in the paid tab/history
    const dayPayments = appData.payments.filter(p => p.loanId === loan.loanId && p.paymentDate.split(" ")[0] === currentReportDate);
    const hasPaidToday = dayPayments.length > 0;
    
    if (hasPaidToday) return true;
    
    // Otherwise, the loan must be due on this date
    if (!isLoanDueOnDate(loan, currentReportDate)) return false;
    
    if (loan.status === "active") return true;
    if (loan.status === "completed") {
      const finalPay = appData.payments.find(p => p.loanId === loan.loanId && parseFloat(p.remainingPrincipal) === 0);
      if (finalPay) {
        const finalPayDate = finalPay.paymentDate.split(" ")[0]; // YYYY-MM-DD
        return finalPayDate >= currentReportDate;
      }
      return true; // Fallback
    }
    return false;
  });
  
  // Calculate payments tab counts dynamically
  let countUnpaid = 0;
  let countPaid = 0;
  activeLoans.forEach(loan => {
    const debtor = appData.debtors.find(d => d.debtorId === loan.debtorId);
    if (!debtor) return;
    const dayPayments = appData.payments.filter(p => p.loanId === loan.loanId && p.paymentDate.split(" ")[0] === currentReportDate);
    const totalPaidOnDay = dayPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    if (totalPaidOnDay > 0) {
      countPaid++;
    } else {
      countUnpaid++;
    }
  });
  const countTotal = countPaid + countUnpaid;
  
  const btnPayUnpaid = document.getElementById("btn-pay-unpaid");
  const btnPayPaid = document.getElementById("btn-pay-paid");
  const btnPayAll = document.getElementById("btn-pay-all");
  
  if (btnPayUnpaid) btnPayUnpaid.innerText = `ยังไม่จ่ายวันนี้ (${countUnpaid})`;
  if (btnPayPaid) btnPayPaid.innerText = `จ่ายแล้ววันนี้ (${countPaid})`;
  if (btnPayAll) btnPayAll.innerText = `ทั้งหมด (${countTotal})`;
  
  // Toggle layout icon dynamically
  const toggleIcon = document.getElementById("payments-layout-toggle-icon");
  if (toggleIcon) {
    if (paymentsViewLayout === "compact") {
      // Show card view icon (grid layout represent)
      toggleIcon.innerHTML = `<rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect>`;
    } else {
      // Show list view icon (thin list represent)
      toggleIcon.innerHTML = `<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>`;
    }
  }
  
  let paymentItems = [];
  activeLoans.forEach(loan => {
    const debtor = appData.debtors.find(d => d.debtorId === loan.debtorId);
    if (!debtor) return;
    
    // Filter by search query
    if (currentPaymentsSearchQuery.trim() !== "") {
      const q = currentPaymentsSearchQuery.toLowerCase().trim().replace(/[-\s]/g, "");
      const name = debtor.fullName.toLowerCase().replace(/\s/g, "");
      const phone = debtor.phone.replace(/[-\s]/g, "");
      if (!name.includes(q) && !phone.includes(q)) return;
    }
    
    const dayPayments = appData.payments.filter(p => p.loanId === loan.loanId && p.paymentDate.split(" ")[0] === currentReportDate);
    const totalPaidOnDay = dayPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const hasPaidToday = totalPaidOnDay > 0;
    
    paymentItems.push({
      debtor,
      loan,
      hasPaidToday,
      totalPaidOnDay
    });
  });

  // Apply tab filters
  if (currentPaymentsFilter === "unpaid") {
    paymentItems = paymentItems.filter(item => !item.hasPaidToday);
  } else if (currentPaymentsFilter === "paid") {
    paymentItems = paymentItems.filter(item => item.hasPaidToday);
  }
  
  // Sort by name
  paymentItems.sort((a, b) => a.debtor.fullName.localeCompare(b.debtor.fullName, 'th'));
  
  if (paymentItems.length === 0) {
    let descText = "ไม่มีลูกหนี้ในกลุ่มนี้ในระบบขณะนี้ หรือไม่พบข้อมูลตามคำค้นหา";
    if (currentPaymentsFilter === "unpaid") {
      descText = "🎉 ลูกหนี้ทุกคนจ่ายเงินครบถ้วนแล้วสำหรับวันนี้!";
    }
    
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💸</div>
        <div class="empty-state-title">ไม่มีข้อมูลแสดงผล</div>
        <div class="empty-state-desc">${descText}</div>
      </div>
    `;
    return;
  }
  
  let html = "";
  if (paymentsViewLayout === "compact") {
    html += `<div style="background-color: var(--color-card); border: 1px solid #E5E7EB; display: flex; flex-direction: column;">`;
  }
  
  paymentItems.forEach(item => {
    const debtor = item.debtor;
    const loan = item.loan;
    const hasPaidToday = item.hasPaidToday;
    
    const avatarStyle = getAvatarHtml(debtor.profileImage, "width: 36px; height: 36px; font-size: 12px; flex-shrink: 0;");
    const avatarContent = getAvatarContent(debtor.profileImage);
    
    const isCompletedOrClosed = loan.status === 'completed' || debtor.status === 'closed';
    
    if (paymentsViewLayout === "compact") {
      let badgeHtml = "";
      if (hasPaidToday) {
        badgeHtml = `<span class="status-badge" style="background-color: rgba(34, 197, 94, 0.1); color: var(--color-success); border: 1px solid var(--color-success); padding: 2px 6px; font-size: 10px; border-radius: 0;">จ่ายแล้ววันนี้ (+฿${item.totalPaidOnDay.toLocaleString()})</span>`;
      } else {
        badgeHtml = `<span class="status-badge" style="background-color: rgba(239, 68, 68, 0.1); color: var(--color-danger); border: 1px solid var(--color-danger); padding: 2px 6px; font-size: 10px; border-radius: 0;">ยังไม่จ่าย</span>`;
      }
      
      html += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background-color: var(--color-card); border-bottom: 1px solid #E5E7EB; cursor: pointer; transition: background 0.2s;" onclick="openReceivePaymentModal('${loan.loanId}', '${debtor.debtorId}')" class="compact-debtor-row">
          <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
            <div class="debtor-avatar" ${avatarStyle}>
              ${avatarContent}
            </div>
            <div style="min-width: 0; flex: 1;">
              <div style="font-weight: 600; font-size: 14px; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${debtor.fullName}</div>
              <div style="font-size: 11px; color: var(--color-text-secondary); display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
                <span>ต้นค้าง: ฿${parseFloat(loan.remainingPrincipal).toLocaleString()}</span>
                <span style="color: #D1D5DB;">|</span>
                <span>${getFrequencyDueLabel(loan.paymentFrequency)}: ฿${isCompletedOrClosed ? '0' : parseFloat(loan.interestPerDay).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-left: 8px; flex-shrink: 0;">
            ${badgeHtml}
            ${hasPaidToday ? `
              <button class="btn btn-secondary" onclick="event.stopPropagation(); openReceivePaymentModal('${loan.loanId}', '${debtor.debtorId}')" style="height: 32px; font-size: 11px; padding: 0 10px; width: auto; flex: none; border-radius: 0;">
                เงินเพิ่ม
              </button>
            ` : `
              <button class="btn btn-primary" onclick="event.stopPropagation(); openReceivePaymentModal('${loan.loanId}', '${debtor.debtorId}')" style="height: 32px; font-size: 11px; padding: 0 10px; width: auto; flex: none; border-radius: 0;">
                รับเงิน
              </button>
            `}
          </div>
        </div>
      `;
    } else {
      let badgeHtml = "";
      if (hasPaidToday) {
        badgeHtml = `<span class="status-badge" style="background-color: rgba(34, 197, 94, 0.1); color: var(--color-success); border: 1px solid var(--color-success); border-radius: 0;">จ่ายแล้ววันนี้ (+฿${item.totalPaidOnDay.toLocaleString()})</span>`;
      } else {
        badgeHtml = `<span class="status-badge" style="background-color: rgba(239, 68, 68, 0.1); color: var(--color-danger); border: 1px solid var(--color-danger); border-radius: 0;">ยังไม่จ่าย</span>`;
      }
      
      html += `
        <div class="card debtor-card" onclick="openReceivePaymentModal('${loan.loanId}', '${debtor.debtorId}')">
          <div class="debtor-card-header">
            <div class="debtor-name-container">
              <div class="debtor-avatar" ${avatarStyle}>
                ${avatarContent}
              </div>
              <div>
                <div class="debtor-name">${debtor.fullName}</div>
                <div class="debtor-phone">${formatPhone(debtor.phone)}</div>
              </div>
            </div>
            ${badgeHtml}
          </div>
          
          <div class="debtor-card-body">
            <div class="info-item">
              <span class="info-label">เงินต้นค้างชำระ</span>
              <span class="info-value text-danger">฿${parseFloat(loan.remainingPrincipal).toLocaleString()}</span>
            </div>
            <div class="info-item">
              <span class="info-label">${getFrequencyDueLabel(loan.paymentFrequency)}</span>
              <span class="info-value text-warning">฿${isCompletedOrClosed ? '0' : parseFloat(loan.interestPerDay).toLocaleString()}</span>
            </div>
          </div>
          
          <div class="debtor-card-actions" onclick="event.stopPropagation();">
            ${hasPaidToday ? `
              <button class="btn btn-secondary w-full" onclick="openReceivePaymentModal('${loan.loanId}', '${debtor.debtorId}')" style="height:48px; border-radius:0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="10" x2="12" y2="10"></line><line x1="8" y1="14" x2="16" y2="14"></line></svg>
                บันทึกรับเงินเพิ่ม
              </button>
            ` : `
              <button class="btn btn-primary w-full" onclick="openReceivePaymentModal('${loan.loanId}', '${debtor.debtorId}')" style="height:48px; border-radius:0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="10" x2="12" y2="10"></line><line x1="8" y1="14" x2="16" y2="14"></line></svg>
                บันทึกรับเงิน
              </button>
            `}
          </div>
        </div>
      `;
    }
  });
  
  if (paymentsViewLayout === "compact") {
    html += `</div>`;
  }
  
  container.innerHTML = html;
}

function handlePaymentsSearch(val) {
  currentPaymentsSearchQuery = val;
  renderPaymentsList();
}

// ==========================================
// MODULE 3.5: OVERDUE LIST & SEARCH & FILTER
// ==========================================
let currentOverdueFilter = "all"; // "all", "3", "7", "15"
let currentOverdueSearch = "";
let overdueViewLayout = "compact"; // "compact" or "card"

function toggleOverdueLayout() {
  overdueViewLayout = overdueViewLayout === "compact" ? "card" : "compact";
  renderOverdueList();
}

function switchOverdueFilter(daysFilter) {
  currentOverdueFilter = daysFilter;
  
  // Update active style on filter pills
  const filters = ["all", "3", "7", "15"];
  filters.forEach(f => {
    const btn = document.getElementById(`btn-overdue-${f}`);
    if (btn) {
      if (f === daysFilter) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
  });
  
  renderOverdueList();
}

function handleOverdueSearch(val) {
  currentOverdueSearch = val;
  renderOverdueList();
}

function getOverdueFilterLabel(num, items) {
  const frequencies = new Set(items.map(item => item.loan.paymentFrequency || "daily"));
  if (frequencies.size === 1) {
    const freq = frequencies.values().next().value;
    if (freq === "daily") return `เกิน ${num} วัน`;
    if (freq === "weekly") return `เกิน ${num} สัปดาห์`;
    if (freq === "monthly") return `เกิน ${num} เดือน`;
  }
  return `เกิน ${num} วัน/รอบ`;
}

function renderOverdueList() {
  const container = document.getElementById("overdue-list");
  if (!container) return;
  
  // Find overdue loans
  const activeLoans = appData.loans.filter(l => l.status === "active" && l.remainingPrincipal > 0);
  
  let overdueItems = [];
  activeLoans.forEach(loan => {
    const overdueInfo = getLoanOverdueInfo(loan);
    if (overdueInfo.isOverdue) {
      const debtor = appData.debtors.find(d => d.debtorId === loan.debtorId);
      if (debtor && debtor.status === "active") {
        overdueItems.push({
          debtor,
          loan,
          overdueInfo
        });
      }
    }
  });
  
  // Update Overdue tab counts dynamically
  const countAll = overdueItems.length;
  const count3 = overdueItems.filter(item => item.overdueInfo.overdueDays > 3).length;
  const count7 = overdueItems.filter(item => item.overdueInfo.overdueDays > 7).length;
  const count15 = overdueItems.filter(item => item.overdueInfo.overdueDays > 15).length;
  
  const btnOverdueAll = document.getElementById("btn-overdue-all");
  const btnOverdue3 = document.getElementById("btn-overdue-3");
  const btnOverdue7 = document.getElementById("btn-overdue-7");
  const btnOverdue15 = document.getElementById("btn-overdue-15");
  
  if (btnOverdueAll) btnOverdueAll.innerText = `ทั้งหมด (${countAll})`;
  if (btnOverdue3) btnOverdue3.innerText = `${getOverdueFilterLabel(3, overdueItems)} (${count3})`;
  if (btnOverdue7) btnOverdue7.innerText = `${getOverdueFilterLabel(7, overdueItems)} (${count7})`;
  if (btnOverdue15) btnOverdue15.innerText = `${getOverdueFilterLabel(15, overdueItems)} (${count15})`;
  
  // Toggle layout icon dynamically
  const toggleIcon = document.getElementById("overdue-layout-toggle-icon");
  if (toggleIcon) {
    if (overdueViewLayout === "compact") {
      // Show card view icon (grid layout represent)
      toggleIcon.innerHTML = `<rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect>`;
    } else {
      // Show list view icon (thin list represent)
      toggleIcon.innerHTML = `<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>`;
    }
  }
  
  // Filter by overdue days filter
  if (currentOverdueFilter === "3") {
    overdueItems = overdueItems.filter(item => item.overdueInfo.overdueDays > 3);
  } else if (currentOverdueFilter === "7") {
    overdueItems = overdueItems.filter(item => item.overdueInfo.overdueDays > 7);
  } else if (currentOverdueFilter === "15") {
    overdueItems = overdueItems.filter(item => item.overdueInfo.overdueDays > 15);
  }
  
  // Filter by search query
  if (currentOverdueSearch.trim() !== "") {
    const q = currentOverdueSearch.toLowerCase().trim().replace(/[-\s]/g, "");
    overdueItems = overdueItems.filter(item => {
      const name = item.debtor.fullName.toLowerCase().replace(/\s/g, "");
      const phone = item.debtor.phone.replace(/[-\s]/g, "");
      return name.includes(q) || phone.includes(q);
    });
  }
  
  // Sort by overdue days descending (most urgent first)
  overdueItems.sort((a, b) => b.overdueInfo.overdueDays - a.overdueInfo.overdueDays);
  
  if (overdueItems.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✅</div>
        <div class="empty-state-title">ไม่มีลูกหนี้ค้างชำระ</div>
        <div class="empty-state-desc">ไม่มีลูกหนี้ในกลุ่มนี้ที่ค้างชำระดอกเบี้ย</div>
      </div>
    `;
    return;
  }
  
  let html = "";
  if (overdueViewLayout === "compact") {
    html += `<div style="background-color: var(--color-card); border: 1px solid #E5E7EB; display: flex; flex-direction: column;">`;
  }
  
  overdueItems.forEach(item => {
    const avatarStyle = getAvatarHtml(item.debtor.profileImage, "width: 36px; height: 36px; font-size: 12px; flex-shrink: 0;");
    const avatarContent = getAvatarContent(item.debtor.profileImage);
    
    if (overdueViewLayout === "compact") {
      html += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background-color: var(--color-card); border-bottom: 1px solid #E5E7EB; border-left: 4px solid var(--color-danger); cursor: pointer; transition: background 0.2s;" onclick="viewDebtorDetails('${item.debtor.debtorId}')" class="compact-debtor-row">
          <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
            <div class="debtor-avatar" ${avatarStyle}>
              ${avatarContent}
            </div>
            <div style="min-width: 0; flex: 1;">
              <div style="font-weight: 600; font-size: 14px; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.debtor.fullName}</div>
              <div style="font-size: 11px; color: var(--color-text-secondary); display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
                <span>ต้นค้าง: ฿${parseFloat(item.loan.remainingPrincipal).toLocaleString()}</span>
                <span style="color: #D1D5DB;">|</span>
                <span style="color: #EF4444; font-weight: 600;">ดอกค้าง: ฿${parseFloat(item.overdueInfo.outstandingInterest).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-left: 8px; flex-shrink: 0;">
            <span class="status-badge" style="background-color: #FEE2E2; color: #EF4444; border: 1px solid #FCA5A5; padding: 2px 6px; font-size: 10px; border-radius: 0;">เกิน ${item.overdueInfo.overdueDays} ${getFrequencyUnitName(item.loan.paymentFrequency)}</span>
            <button class="btn btn-primary" onclick="event.stopPropagation(); openReceivePaymentModal('${item.loan.loanId}', '${item.debtor.debtorId}')" style="height: 32px; font-size: 11px; padding: 0 10px; width: auto; flex: none; border-radius: 0; background-color: #EF4444; border-color: #EF4444;">
              รับเงิน
            </button>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="card debtor-card" onclick="viewDebtorDetails('${item.debtor.debtorId}')" style="border-left: 5px solid var(--color-danger); border-radius: 0;">
          <div class="debtor-card-header">
            <div class="debtor-name-container">
              <div class="debtor-avatar" ${avatarStyle}>
                ${avatarContent}
              </div>
              <div>
                <div class="debtor-name">${item.debtor.fullName}</div>
                <div class="debtor-phone">${formatPhone(item.debtor.phone)}</div>
              </div>
            </div>
            <span class="status-badge" style="background-color: #FEE2E2; color: #EF4444; border: 1px solid #FCA5A5; border-radius: 0;">
              เกินชำระ ${item.overdueInfo.overdueDays} ${getFrequencyUnitName(item.loan.paymentFrequency)}
            </span>
          </div>
          
          <div class="debtor-card-body" style="background-color: #FEF2F2; padding: 12px; margin: 8px 0; border: 1px solid #FEE2E2; border-radius: 0;">
            <div class="info-item">
              <span class="info-label" style="color: #991B1B; font-weight: 600;">ดอกค้างสะสม (ทบดอก)</span>
              <span class="info-value" style="color: #EF4444; font-weight: 700; font-size: 16px;">฿${parseFloat(item.overdueInfo.outstandingInterest).toLocaleString()}</span>
            </div>
            <div class="info-item">
              <span class="info-label">${getFrequencyInterestLabel(item.loan.paymentFrequency)}</span>
              <span class="info-value">฿${parseFloat(item.loan.interestPerDay).toLocaleString()} / ${getFrequencyUnitName(item.loan.paymentFrequency)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">เงินต้นคงเหลือ</span>
              <span class="info-value">฿${parseFloat(item.loan.remainingPrincipal).toLocaleString()}</span>
            </div>
            <div class="info-item">
              <span class="info-label">วันที่เริ่มกู้</span>
              <span class="info-value">${item.loan.loanDate}</span>
            </div>
          </div>
          
          <div class="debtor-card-actions" onclick="event.stopPropagation();">
            <button class="btn btn-secondary" onclick="viewDebtorDetails('${item.debtor.debtorId}')">รายละเอียด</button>
            <button class="btn btn-primary" onclick="openReceivePaymentModal('${item.loan.loanId}', '${item.debtor.debtorId}')" style="background-color: #EF4444; border-color: #EF4444;">
              รับเงิน
            </button>
          </div>
        </div>
      `;
    }
  });
  
  if (overdueViewLayout === "compact") {
    html += `</div>`;
  }
  
  container.innerHTML = html;
}

// ==========================================
// MODULE 3: ADD DEBTOR & CONTRACT
// ==========================================
function openAddDebtorSheet() {
  // Load default interest and minDays from settings
  document.getElementById("add-principal").value = "";
  document.getElementById("add-interest").value = appData.settings.defaultInterestPerDay;
  document.getElementById("add-minDays").value = appData.settings.defaultMinimumDays;
  
  // Set default start date to today's date in local time
  const tzoffset = (new Date()).getTimezoneOffset() * 60000;
  const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
  document.getElementById("add-loanDate").value = localISOTime;
  
  // Reset payment frequency to daily
  document.getElementById("add-frequency").value = "daily";
  updateInterestFrequencyLabel("daily");
  
  openSheet("add-debtor-sheet");
}

function updateInterestFrequencyLabel(freq) {
  const lblInterest = document.getElementById("lbl-add-interest");
  const lblMinDays = document.getElementById("lbl-add-minDays");
  const inputInterest = document.getElementById("add-interest");
  const inputMinDays = document.getElementById("add-minDays");
  
  if (freq === "daily") {
    if (lblInterest) lblInterest.innerHTML = `ดอกเบี้ยต่อวัน (บาท) <span>*</span>`;
    if (lblMinDays) lblMinDays.innerHTML = `จำนวนวันขั้นต่ำกู้ยืม (วัน) <span>*</span>`;
    if (inputInterest) inputInterest.placeholder = "เช่น 100";
    if (inputMinDays) inputMinDays.placeholder = "เช่น 5";
  } else if (freq === "weekly") {
    if (lblInterest) lblInterest.innerHTML = `ดอกเบี้ยต่อสัปดาห์ (บาท) <span>*</span>`;
    if (lblMinDays) lblMinDays.innerHTML = `จำนวนสัปดาห์ขั้นต่ำกู้ยืม (สัปดาห์) <span>*</span>`;
    if (inputInterest) inputInterest.placeholder = "เช่น 500";
    if (inputMinDays) inputMinDays.placeholder = "เช่น 2";
  } else if (freq === "monthly") {
    if (lblInterest) lblInterest.innerHTML = `ดอกเบี้ยต่อเดือน (บาท) <span>*</span>`;
    if (lblMinDays) lblMinDays.innerHTML = `จำนวนเดือนขั้นต่ำกู้ยืม (เดือน) <span>*</span>`;
    if (inputInterest) inputInterest.placeholder = "เช่น 2000";
    if (inputMinDays) inputMinDays.placeholder = "เช่น 1";
  }
}

// Trigger input files programmatically
function triggerFileInput(id) {
  document.getElementById(id).click();
}

// Handle file selection and read as base64
function handleFileSelect(input, type) {
  const file = input.files[0];
  if (!file) return;
  
  // Limit to 5MB
  if (file.size > 5 * 1024 * 1024) {
    showToast("ขนาดไฟล์ต้องไม่เกิน 5MB", "danger");
    input.value = "";
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Data = e.target.result.split(",")[1];
    tempUploadedFiles[type] = {
      name: file.name,
      mimeType: file.type,
      base64: base64Data
    };
    
    // Show thumbnail preview in UI card
    const previewDiv = document.getElementById(`preview-${type}`);
    previewDiv.style.backgroundImage = `url('${e.target.result}')`;
    previewDiv.classList.add("has-image");
  };
  reader.readAsDataURL(file);
}

// Remove uploaded file from cache
function removeUploadedFile(event, type, inputId) {
  event.stopPropagation();
  
  tempUploadedFiles[type] = null;
  
  // Clear HTML input
  document.getElementById(inputId).value = "";
  
  // Reset UI preview
  const previewDiv = document.getElementById(`preview-${type}`);
  previewDiv.style.backgroundImage = "none";
  previewDiv.classList.remove("has-image");
}

function clearFilePreviews() {
  tempUploadedFiles = { idcard: null, housereg: null, house: null, profile: null };
  const previews = ["idcard", "housereg", "house", "profile"];
  previews.forEach(p => {
    const previewDiv = document.getElementById(`preview-${p}`);
    previewDiv.style.backgroundImage = "none";
    previewDiv.classList.remove("has-image");
    
    const input = document.getElementById(`file-${p}`);
    if (input) input.value = "";
  });
}

// Submit debtor add form
async function submitAddDebtor(e) {
  e.preventDefault();
  
  const fullName = document.getElementById("add-fullName").value.trim();
  const phone = document.getElementById("add-phone").value.trim();
  const principal = parseFloat(document.getElementById("add-principal").value);
  const interestPerDay = parseFloat(document.getElementById("add-interest").value);
  const minimumDays = parseInt(document.getElementById("add-minDays").value);
  
  const nationalId = document.getElementById("add-nationalId").value.trim();
  const occupation = document.getElementById("add-occupation").value.trim();
  const address = document.getElementById("add-address").value.trim();
  const facebook = document.getElementById("add-facebook").value.trim();
  const lineId = document.getElementById("add-lineId").value.trim();
  const googleMap = document.getElementById("add-googleMap").value.trim();
  const note = document.getElementById("add-note").value.trim();
  
  if (!fullName || !phone || isNaN(principal) || isNaN(interestPerDay) || isNaN(minimumDays)) {
    showToast("กรุณากรอกข้อมูลจำเป็นให้ครบถ้วน", "danger");
    return;
  }
  
  showLoading("กำลังสร้างสัญญากู้ยืมใหม่...");
  
  const debtorId = "debtor-" + Date.now();
  const loanId = "loan-" + Date.now();
  const nowStr = new Date().toISOString();
  
  const loanDateInput = document.getElementById("add-loanDate").value;
  const dateStr = loanDateInput || formatDateStr(new Date());
  const paymentFrequency = document.getElementById("add-frequency").value || "daily";

  const newDebtor = {
    debtorId,
    fullName,
    phone,
    nationalId,
    address,
    occupation,
    facebook,
    lineId,
    googleMap,
    note,
    status: "active",
    idCardImage: "",
    houseRegistrationImage: "",
    houseImage: "",
    profileImage: "",
    createdAt: nowStr
  };
  
  const newLoan = {
    loanId,
    debtorId,
    loanDate: dateStr,
    principal,
    remainingPrincipal: principal,
    interestPerDay,
    minimumDays,
    status: "active",
    paymentFrequency,
    createdAt: nowStr
  };
  
  try {
    if (apiMode) {
      // Build API request payload including files
      const payload = {
        debtor: newDebtor,
        loan: newLoan,
        files: tempUploadedFiles
      };
      
      const res = await callApi("addDebtor", payload);
      if (res && res.success) {
        showToast("เพิ่มสัญญาและลูกหนี้เรียบร้อยแล้ว");
        closeSheet("add-debtor-sheet");
        refreshData();
      } else {
        showToast(res.message || "เกิดข้อผิดพลาดในการบันทึกสัญญา", "danger");
      }
    } else {
      // Save locally (Simulate file URLs with objectURLs or base64)
      if (tempUploadedFiles.profile) {
        newDebtor.profileImage = `data:${tempUploadedFiles.profile.mimeType};base64,${tempUploadedFiles.profile.base64}`;
      }
      if (tempUploadedFiles.idcard) {
        newDebtor.idCardImage = `data:${tempUploadedFiles.idcard.mimeType};base64,${tempUploadedFiles.idcard.base64}`;
      }
      if (tempUploadedFiles.housereg) {
        newDebtor.houseRegistrationImage = `data:${tempUploadedFiles.housereg.mimeType};base64,${tempUploadedFiles.housereg.base64}`;
      }
      if (tempUploadedFiles.house) {
        newDebtor.houseImage = `data:${tempUploadedFiles.house.mimeType};base64,${tempUploadedFiles.house.base64}`;
      }
      
      appData.debtors.unshift(newDebtor);
      appData.loans.unshift(newLoan);
      saveLocalCache();
      
      showToast("เพิ่มข้อมูลลูกหนี้จำลองเรียบร้อยแล้ว");
      closeSheet("add-debtor-sheet");
      refreshData();
    }
  } catch (err) {
    console.error(err);
    showToast("เกิดข้อผิดพลาดในการดำเนินงาน", "danger");
  } finally {
    hideLoading();
  }
}

// ==========================================
// MODULE 5: RECEIVE PAYMENT & PREVIEW
// ==========================================
function openReceivePaymentModal(loanId, debtorId) {
  const debtor = appData.debtors.find(d => d.debtorId === debtorId);
  const loan = appData.loans.find(l => l.loanId === loanId);
  
  if (!debtor || !loan) {
    showToast("ไม่พบข้อมูลสัญญานี้", "danger");
    return;
  }
  
  const freq = loan.paymentFrequency || "daily";
  document.getElementById("lbl-pay-debtor-interest").innerText = getFrequencyInterestLabel(freq);
  
  document.getElementById("pay-loan-id").value = loanId;
  document.getElementById("pay-debtor-id").value = debtorId;
  document.getElementById("pay-debtor-name").innerText = debtor.fullName;
  document.getElementById("pay-debtor-remaining").innerText = `฿${loan.remainingPrincipal.toLocaleString()}`;
  document.getElementById("pay-debtor-interest").innerText = `฿${loan.interestPerDay.toLocaleString()}`;
  
  // Calculate dynamic payoff amount (Remaining principal + Remaining min/accrued interest)
  const loanPayments = appData.payments.filter(p => p.loanId === loan.loanId);
  const totalInterestPaidSoFar = loanPayments.reduce((sum, p) => sum + parseFloat(p.interestPaid || 0), 0);
  const minInterest = loan.interestPerDay * loan.minimumDays;
  const remainingMinInterest = Math.max(0, minInterest - totalInterestPaidSoFar);
  const outstandingInterest = getLoanOverdueInfo(loan).outstandingInterest; // ดอกค้างสะสมตามวันจริง
  const periodInterest = Math.max(outstandingInterest, loan.interestPerDay); // ดอกที่ต้องจ่ายรอบนี้
  const remainingInterest = Math.max(periodInterest, remainingMinInterest);  // รวม: ดอกค้าง vs ขั้นต่ำ
  const maxPossiblePayment = loan.remainingPrincipal + remainingInterest;
  
  const btnClose = document.getElementById("btn-pay-close-loan");
  if (btnClose) {
    btnClose.innerHTML = `⚡ ปิดยอดทันที (฿${maxPossiblePayment.toLocaleString()})`;
  }
  
  document.getElementById("pay-amount").value = "";
  document.getElementById("payment-warning").style.display = "none";
  calculatePaymentPreview(0); // Reset preview
  
  openSheet("payment-sheet");
}

function openQuickPaySheet() {
  // If we have an active debtor from detail page, use it
  if (activeDebtorId) {
    const loan = appData.loans.find(l => l.debtorId === activeDebtorId && l.status === "active");
    if (loan) {
      openReceivePaymentModal(loan.loanId, activeDebtorId);
      return;
    }
  }
  
  // Otherwise redirect to debtors tab to select debtor
  showToast("กรุณาเลือกปุ่ม 'รับเงิน' จากลูกหนี้ที่ต้องการชำระ", "danger");
  switchTab("debtors");
}

function fillPayoffAmount() {
  const loanId = document.getElementById("pay-loan-id").value;
  const loan = appData.loans.find(l => l.loanId === loanId);
  if (!loan) return;
  
  const loanPayments = appData.payments.filter(p => p.loanId === loan.loanId);
  const totalInterestPaidSoFar = loanPayments.reduce((sum, p) => sum + parseFloat(p.interestPaid || 0), 0);
  const minInterest = loan.interestPerDay * loan.minimumDays;
  const remainingMinInterest = Math.max(0, minInterest - totalInterestPaidSoFar);
  const outstandingInterest = getLoanOverdueInfo(loan).outstandingInterest;
  const periodInterest = Math.max(outstandingInterest, loan.interestPerDay);
  const remainingInterest = Math.max(periodInterest, remainingMinInterest);
  const maxPossiblePayment = loan.remainingPrincipal + remainingInterest;
  
  const input = document.getElementById("pay-amount");
  if (input) {
    input.value = maxPossiblePayment;
    calculatePaymentPreview(maxPossiblePayment);
  }
}

// Real-time payment calculation preview (with overpayment cap)
function calculatePaymentPreview(amount) {
  amount = parseFloat(amount);
  
  const loanId = document.getElementById("pay-loan-id").value;
  const loan = appData.loans.find(l => l.loanId === loanId);
  const warningDiv = document.getElementById("payment-warning");
  
  if (isNaN(amount) || amount <= 0 || !loan) {
    document.getElementById("preview-total").innerText = "฿0.00";
    document.getElementById("preview-interest-paid").innerText = "฿0.00";
    document.getElementById("preview-principal-paid").innerText = "฿0.00";
    document.getElementById("preview-remaining-principal").innerText = "฿0.00";
    warningDiv.style.display = "none";
    return;
  }
  
  // Calculate minimum interest criteria
  const loanPayments = appData.payments.filter(p => p.loanId === loan.loanId);
  const totalInterestPaidSoFar = loanPayments.reduce((sum, p) => sum + parseFloat(p.interestPaid || 0), 0);
  const minInterest = loan.interestPerDay * loan.minimumDays;
  const remainingMinInterest = Math.max(0, minInterest - totalInterestPaidSoFar);
  const outstandingInterest = getLoanOverdueInfo(loan).outstandingInterest; // ดอกค้างสะสม
  const periodInterest = Math.max(outstandingInterest, loan.interestPerDay); // ดอกที่ต้องจ่ายรอบนี้
  const remainingInterest = Math.max(periodInterest, remainingMinInterest);
  
  // Outstanding total to fully clear loan (remaining principal + remaining minimum/accrued interest required)
  const maxPossiblePayment = loan.remainingPrincipal + remainingInterest;
  
  // Enforce minimum payment size (cannot be less than periodInterest, unless it's to close the loan)
  if (amount < periodInterest && amount < maxPossiblePayment) {
    document.getElementById("preview-total").innerText = "฿0.00";
    document.getElementById("preview-interest-paid").innerText = "฿0.00";
    document.getElementById("preview-principal-paid").innerText = "฿0.00";
    document.getElementById("preview-remaining-principal").innerText = "฿0.00";
    const minLabel = outstandingInterest > loan.interestPerDay
      ? `ดอกค้างสะสม (ขั้นต่ำ ฿${periodInterest.toLocaleString()})`
      : `${getFrequencyInterestLabel(loan.paymentFrequency)} (ขั้นต่ำ ฿${periodInterest.toLocaleString()})`;
    warningDiv.innerText = `⚠️ ยอดรับชำระห้ามต่ำกว่า${minLabel}`;
    warningDiv.style.display = "block";
    return;
  }
  
  let finalAmount = amount;
  let showOverLimitWarning = false;
  
  if (amount > maxPossiblePayment) {
    finalAmount = maxPossiblePayment;
    showOverLimitWarning = true;
  }
  
  // Rule: Deduct Interest first (all outstanding/period interest), then Principal
  let interestPaid = 0;
  let principalPaid = 0;
  
  // Use periodInterest (ดอกค้างสะสมหรือดอกรอบนี้) as the interest deduction bucket
  const tempInterestPaid = Math.min(finalAmount, periodInterest);
  const tempPrincipalPaid = Math.max(0, finalAmount - tempInterestPaid);
  
  if (finalAmount >= maxPossiblePayment) {
    // Payoff payment: clears the loan
    interestPaid = remainingInterest;
    principalPaid = loan.remainingPrincipal;
  } else {
    // Partial payment: does not clear the loan
    if (tempPrincipalPaid >= loan.remainingPrincipal) {
      // Cannot clear principal without paying payoffAmount.
      // Cap principal paid so remaining principal is at least 1 unit, and allocate the rest to interest.
      principalPaid = Math.max(0, loan.remainingPrincipal - 1);
      interestPaid = finalAmount - principalPaid;
    } else {
      interestPaid = tempInterestPaid;
      principalPaid = tempPrincipalPaid;
    }
  }
  
  const newRemaining = loan.remainingPrincipal - principalPaid;

  // Handle warnings display after calculation
  if (showOverLimitWarning) {
    warningDiv.innerText = `⚠️ ยอดชำระเกินยอดค้างชำระรวมดอกเบี้ยขั้นต่ำ (฿${maxPossiblePayment.toLocaleString()}) ระบบจะปรับยอดรับเงินเป็น ฿${maxPossiblePayment.toLocaleString()} โดยอัตโนมัติ`;
    warningDiv.style.display = "block";
  } else if (tempPrincipalPaid >= loan.remainingPrincipal && newRemaining > 0) {
    warningDiv.innerText = `⚠️ ยอดชำระนี้ยังไม่พอสำหรับปิดยอด (ยอดปิดยอดคือ ฿${maxPossiblePayment.toLocaleString()}) ระบบจะหักเป็นดอกเบี้ยสะสม ฿${interestPaid.toLocaleString()} และหักเงินต้น ฿${principalPaid.toLocaleString()} (เหลือเงินต้น ฿${newRemaining.toLocaleString()})`;
    warningDiv.style.display = "block";
  } else {
    warningDiv.style.display = "none";
  }
  
  document.getElementById("preview-total").innerText = `฿${finalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
  document.getElementById("preview-interest-paid").innerText = `฿${interestPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
  document.getElementById("preview-principal-paid").innerText = `฿${principalPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
  document.getElementById("preview-remaining-principal").innerText = `฿${newRemaining.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
}

// Submit Payment (with overpayment cap and minimum days interest guarantee)
async function submitPayment(e) {
  e.preventDefault();
  
  const loanId = document.getElementById("pay-loan-id").value;
  const debtorId = document.getElementById("pay-debtor-id").value;
  let amount = parseFloat(document.getElementById("pay-amount").value);
  
  if (isNaN(amount) || amount <= 0) {
    showToast("กรุณากรอกยอดเงินชำระให้ถูกต้อง", "danger");
    return;
  }
  
  const loan = appData.loans.find(l => l.loanId === loanId);
  if (!loan) return;

  // Calculate minimum interest criteria
  const loanPayments = appData.payments.filter(p => p.loanId === loan.loanId);
  const totalInterestPaidSoFar = loanPayments.reduce((sum, p) => sum + parseFloat(p.interestPaid || 0), 0);
  const minInterest = loan.interestPerDay * loan.minimumDays;
  const remainingMinInterest = Math.max(0, minInterest - totalInterestPaidSoFar);
  const outstandingInterest = getLoanOverdueInfo(loan).outstandingInterest;
  const periodInterest = Math.max(outstandingInterest, loan.interestPerDay);
  const remainingInterest = Math.max(periodInterest, remainingMinInterest);
  
  // Cap the amount automatically to avoid overflow (remainingPrincipal + remainingInterest)
  const maxPossiblePayment = loan.remainingPrincipal + remainingInterest;

  // Enforce minimum payment validation on submit
  if (amount < periodInterest && amount < maxPossiblePayment) {
    const minLabel = outstandingInterest > loan.interestPerDay
      ? `ดอกค้างสะสม (฿${periodInterest.toLocaleString()})`
      : `${getFrequencyInterestLabel(loan.paymentFrequency)} (฿${periodInterest.toLocaleString()})`;
    showToast(`ยอดชำระขั้นต่ำห้ามต่ำกว่า${minLabel}`, "danger");
    return;
  }
  
  if (amount > maxPossiblePayment) {
    amount = maxPossiblePayment;
  }
  
  // Calculate final numbers
  let interestPaid = 0;
  let principalPaid = 0;
  
  // Deduct periodInterest (ดอกค้างทั้งหมดหรือดอกรอบนี้) first, then principal
  const tempInterestPaid = Math.min(amount, periodInterest);
  const tempPrincipalPaid = Math.max(0, amount - tempInterestPaid);
  
  if (amount >= maxPossiblePayment) {
    // Payoff payment: clears the loan
    interestPaid = remainingInterest;
    principalPaid = loan.remainingPrincipal;
  } else {
    // Partial payment: does not clear the loan
    if (tempPrincipalPaid >= loan.remainingPrincipal) {
      // Cannot clear principal without paying payoffAmount.
      // Cap principal paid so remaining principal is at least 1 unit, and allocate the rest to interest.
      principalPaid = Math.max(0, loan.remainingPrincipal - 1);
      interestPaid = amount - principalPaid;
    } else {
      interestPaid = tempInterestPaid;
      principalPaid = tempPrincipalPaid;
    }
  }
  
  const newRemaining = loan.remainingPrincipal - principalPaid;
  
  const paymentId = "pay-" + Date.now();
  const now = new Date();
  
  // Formatting dates (Align with the selected report date to allow real-time updates and backdating)
  let year = now.getFullYear();
  let month = String(now.getMonth() + 1).padStart(2, '0');
  let date = String(now.getDate()).padStart(2, '0');
  
  if (currentReportDate) {
    const parts = currentReportDate.split("-");
    if (parts.length === 3) {
      year = parts[0];
      month = parts[1];
      date = parts[2];
    }
  }
  
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const paymentDateStr = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
  
  // Parse in local time format for ISO
  const nowStr = new Date(`${year}-${month}-${date}T${hours}:${minutes}:${seconds}`).toISOString();

  const newPayment = {
    paymentId,
    loanId,
    paymentDate: paymentDateStr,
    amount,
    interestPaid,
    principalPaid,
    remainingPrincipal: newRemaining,
    createdAt: nowStr
  };
  
  showLoading("กำลังบันทึกยอดชำระเงิน...");
  
  try {
    if (apiMode) {
      const res = await callApi("receivePayment", {
        payment: newPayment,
        loanId: loanId,
        debtorId: debtorId,
        newRemainingPrincipal: newRemaining,
        isCompleted: newRemaining <= 0
      });
      
      if (res && res.success) {
        showToast("บันทึกการชำระเงินเรียบร้อยแล้ว");
        closeSheet("payment-sheet");
        refreshData();
      } else {
        showToast(res.message || "เกิดข้อผิดพลาดในการบันทึก", "danger");
      }
    } else {
      // Local save
      appData.payments.unshift(newPayment);
      
      // Update Loan
      loan.remainingPrincipal = newRemaining;
      if (newRemaining <= 0) {
        loan.status = "completed";
        // Also update debtor status if they have no other active loans
        const hasOtherActiveLoans = appData.loans.some(l => l.debtorId === debtorId && l.loanId !== loanId && l.status === "active" && parseFloat(l.remainingPrincipal) > 0);
        if (!hasOtherActiveLoans) {
          const debtor = appData.debtors.find(d => d.debtorId === debtorId);
          if (debtor) debtor.status = "closed";
        }
      }
      
      saveLocalCache();
      showToast("บันทึกยอดชำระเงินจำลองเรียบร้อยแล้ว");
      closeSheet("payment-sheet");
      refreshData();
    }
  } catch (err) {
    console.error(err);
    showToast("เกิดข้อผิดพลาดในการดำเนินการ", "danger");
  } finally {
    hideLoading();
  }
}

// ==========================================
// MODULE 6: DEBTOR DETAILS RENDERING
// ==========================================
function viewDebtorDetails(debtorId) {
  activeDebtorId = debtorId;
  renderDebtorDetails(debtorId);
  switchTab("debtor-details");
  
  // Scroll details back to top
  document.getElementById("debtor-details-page").scrollTop = 0;
}

function renderDebtorDetails(debtorId) {
  const debtor = appData.debtors.find(d => d.debtorId === debtorId);
  // Find active loan first, if none, find latest closed loan
  let loan = appData.loans.find(l => l.debtorId === debtorId && l.status === "active");
  if (!loan) {
    loan = appData.loans.filter(l => l.debtorId === debtorId)
           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  }
  
  if (!debtor) {
    showToast("ไม่พบข้อมูลลูกหนี้", "danger");
    switchTab("debtors");
    return;
  }
  
  // Header details
  const avatarDiv = document.getElementById("detail-avatar");
  if (debtor.profileImage && debtor.profileImage.startsWith("http")) {
    avatarDiv.style.backgroundImage = `url('${debtor.profileImage}')`;
    avatarDiv.innerText = "";
  } else {
    avatarDiv.style.backgroundImage = "none";
    avatarDiv.innerText = debtor.fullName.charAt(0);
  }
  
  document.getElementById("detail-name").innerText = debtor.fullName;
  document.getElementById("detail-phone").href = `tel:${debtor.phone}`;
  document.getElementById("detail-phone-text").innerText = formatPhone(debtor.phone);
  
  const statusBadge = document.getElementById("detail-status");
  if (debtor.status === "active") {
    statusBadge.innerText = "ปกติ";
    statusBadge.className = "status-badge status-active";
  } else {
    statusBadge.innerText = "ปิดยอดแล้ว";
    statusBadge.className = "status-badge status-closed";
  }
  
  // Principal and daily interest values
  const remPrincipal = loan ? parseFloat(loan.remainingPrincipal) : 0;
  const dailyInt = (loan && loan.status !== 'completed' && debtor.status !== 'closed') ? parseFloat(loan.interestPerDay) : 0;
  document.getElementById("detail-stat-remaining").innerText = `฿${remPrincipal.toLocaleString()}`;
  document.getElementById("detail-stat-interest").innerText = `฿${dailyInt.toLocaleString()}`;
  
  // Tab 1: Info panel
  if (loan) {
    const freq = loan.paymentFrequency || "daily";
    document.getElementById("lbl-detail-stat-interest").innerText = getFrequencyInterestLabel(freq);
    document.getElementById("lbl-detail-interest-day").innerText = getFrequencyInterestLabel(freq);
    document.getElementById("lbl-detail-min-days").innerText = getFrequencyMinDaysLabel(freq);

    document.getElementById("detail-loan-date").innerText = loan.loanDate || "-";
    document.getElementById("detail-principal").innerText = `฿${parseFloat(loan.principal).toLocaleString()}`;
    document.getElementById("detail-interest-day").innerText = `฿${parseFloat(loan.interestPerDay).toLocaleString()}`;
    document.getElementById("detail-min-days").innerText = `${loan.minimumDays} ${getFrequencyUnitName(freq)}`;
    
    // Accumulate min interest (interestPerDay * minimumDays)
    const minInterest = parseFloat(loan.interestPerDay) * parseInt(loan.minimumDays);
    document.getElementById("detail-min-interest").innerText = `฿${minInterest.toLocaleString()}`;
  } else {
    document.getElementById("lbl-detail-stat-interest").innerText = "ดอกเบี้ยต่อวัน";
    document.getElementById("lbl-detail-interest-day").innerText = "ดอกเบี้ยรายวัน";
    document.getElementById("lbl-detail-min-days").innerText = "จำนวนวันขั้นต่ำ";

    document.getElementById("detail-loan-date").innerText = "-";
    document.getElementById("detail-principal").innerText = "-";
    document.getElementById("detail-interest-day").innerText = "-";
    document.getElementById("detail-min-days").innerText = "-";
    document.getElementById("detail-min-interest").innerText = "-";
  }
  
  document.getElementById("detail-national-id").innerText = debtor.nationalId || "-";
  document.getElementById("detail-occupation").innerText = debtor.occupation || "-";
  document.getElementById("detail-address").innerText = debtor.address || "-";
  document.getElementById("detail-facebook").innerText = debtor.facebook || "-";
  document.getElementById("detail-line").innerText = debtor.lineId || "-";
  
  const mapLink = document.getElementById("detail-map");
  if (debtor.googleMap && debtor.googleMap.startsWith("http")) {
    mapLink.innerHTML = `<a href="${debtor.googleMap}" target="_blank">เปิดใน Google Maps ↗</a>`;
  } else {
    mapLink.innerText = "-";
  }
  
  document.getElementById("detail-note").innerText = debtor.note || "-";
  
  // Actions panel (only show Payment button if debtor is active)
  const actionsPanel = document.getElementById("detail-actions-panel");
  if (debtor.status === "active" && loan && loan.remainingPrincipal > 0) {
    actionsPanel.className = "debtor-card-actions mb-4";
    document.getElementById("detail-btn-pay").onclick = () => {
      openReceivePaymentModal(loan.loanId, debtor.debtorId);
    };
  } else {
    actionsPanel.className = "debtor-card-actions mb-4 hidden";
  }
  
  // Tab 2: Payments History panel
  const historyContainer = document.getElementById("payment-history-list");
  const loanPayments = loan ? appData.payments.filter(p => p.loanId === loan.loanId)
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
  
  if (loanPayments.length === 0) {
    historyContainer.innerHTML = `
      <div style="text-align:center; padding:20px; font-size:13px; color:var(--color-text-secondary);">
        ยังไม่มีประวัติการชำระเงินของสัญญานี้
      </div>
    `;
  } else {
    let historyHtml = "";
    loanPayments.forEach(p => {
      historyHtml += `
        <div class="history-item">
          <div class="history-left">
            <span class="history-date">${formatDateTime(p.paymentDate)}</span>
            <span class="history-breakdown">หักดอก ฿${parseFloat(p.interestPaid).toLocaleString()} | หักต้น ฿${parseFloat(p.principalPaid).toLocaleString()}</span>
          </div>
          <div class="history-right">
            <span class="history-amount">+฿${parseFloat(p.amount).toLocaleString()}</span>
            <div class="history-balance">คงเหลือ: ฿${parseFloat(p.remainingPrincipal).toLocaleString()}</div>
          </div>
        </div>
      `;
    });
    historyContainer.innerHTML = historyHtml;
  }
  
  // Tab 3: Documents panel
  renderDocumentThumbnail("idCard", debtor.idCardImage, "thumb-idcard");
  renderDocumentThumbnail("houseReg", debtor.houseRegistrationImage, "thumb-housereg");
  renderDocumentThumbnail("house", debtor.houseImage, "thumb-house");
  renderDocumentThumbnail("profile", debtor.profileImage, "thumb-profile");
}

function renderDocumentThumbnail(type, imageUrl, elementId) {
  const element = document.getElementById(elementId);
  if (imageUrl && imageUrl.startsWith("http")) {
    element.innerHTML = "";
    element.style.backgroundImage = `url('${imageUrl}')`;
  } else if (imageUrl && imageUrl.startsWith("data:image")) {
    element.innerHTML = "";
    element.style.backgroundImage = `url('${imageUrl}')`;
  } else {
    element.style.backgroundImage = "none";
    if (type === "idCard") element.innerHTML = "🪪";
    if (type === "houseReg") element.innerHTML = "📜";
    if (type === "house") element.innerHTML = "🏠";
    if (type === "profile") element.innerHTML = "👤";
  }
}

// View full screen image document
function viewDocument(type) {
  if (!activeDebtorId) return;
  const debtor = appData.debtors.find(d => d.debtorId === activeDebtorId);
  if (!debtor) return;
  
  let imageUrl = "";
  let title = "";
  
  if (type === "idCard") {
    imageUrl = debtor.idCardImage;
    title = "บัตรประชาชน - " + debtor.fullName;
  } else if (type === "houseReg") {
    imageUrl = debtor.houseRegistrationImage;
    title = "ทะเบียนบ้าน - " + debtor.fullName;
  } else if (type === "house") {
    imageUrl = debtor.houseImage;
    title = "รูปหน้าบ้าน - " + debtor.fullName;
  } else if (type === "profile") {
    imageUrl = debtor.profileImage;
    title = "รูปลูกหนี้ - " + debtor.fullName;
  }
  
  if (!imageUrl || (!imageUrl.startsWith("http") && !imageUrl.startsWith("data:image"))) {
    showToast("ไม่ได้อัปโหลดเอกสารนี้ไว้", "danger");
    return;
  }
  
  // Set image and active class
  document.getElementById("viewer-image").src = imageUrl;
  document.getElementById("viewer-title").innerText = title;
  document.getElementById("image-viewer-modal").classList.add("active");
}

function closeImageViewer() {
  document.getElementById("image-viewer-modal").classList.remove("active");
}

// ==========================================
// MODULE 7: SETTINGS
// ==========================================
async function updatePin() {
  const oldPin = document.getElementById("set-pin-old").value.trim();
  const newPin = document.getElementById("set-pin-new").value.trim();
  
  if (!oldPin || !newPin) {
    showToast("กรุณากรอกข้อมูล PIN ให้ครบถ้วน", "danger");
    return;
  }
  
  if (newPin.length !== 4 || isNaN(newPin)) {
    showToast("กรุณากรอก PIN ใหม่เป็นตัวเลข 4 หลัก", "danger");
    return;
  }
  
  showLoading("กำลังตรวจสอบและอัปเดต PIN...");
  
  try {
    if (apiMode) {
      const res = await callApi("updatePin", { oldPin, newPin });
      if (res && res.success) {
        showToast("อัปเดตรหัส PIN เข้าระบบเรียบร้อยแล้ว");
        document.getElementById("set-pin-old").value = "";
        document.getElementById("set-pin-new").value = "";
      } else {
        showToast(res.message || "เกิดข้อผิดพลาดในการอัปเดต", "danger");
      }
    } else {
      if (oldPin !== appData.settings.pinCode) {
        showToast("รหัส PIN เดิมไม่ถูกต้อง", "danger");
      } else {
        appData.settings.pinCode = newPin;
        saveLocalCache();
        showToast("อัปเดตรหัส PIN จำลองเรียบร้อยแล้ว");
        document.getElementById("set-pin-old").value = "";
        document.getElementById("set-pin-new").value = "";
      }
    }
  } catch (err) {
    console.error(err);
    showToast("เกิดข้อผิดพลาดในการดำเนินการ", "danger");
  } finally {
    hideLoading();
  }
}

async function updateLoanDefaults() {
  const interest = parseFloat(document.getElementById("set-default-interest").value);
  const minDays = parseInt(document.getElementById("set-default-min-days").value);
  
  if (isNaN(interest) || interest <= 0 || isNaN(minDays) || minDays <= 0) {
    showToast("กรุณากรอกข้อมูลตัวเลขให้ถูกต้อง", "danger");
    return;
  }
  
  showLoading("กำลังบันทึกค่าเริ่มต้น...");
  
  try {
    if (apiMode) {
      const res = await callApi("updateSettings", {
        defaultInterestPerDay: interest,
        defaultMinimumDays: minDays
      });
      if (res && res.success) {
        appData.settings.defaultInterestPerDay = interest;
        appData.settings.defaultMinimumDays = minDays;
        showToast("บันทึกค่าเริ่มต้นสำเร็จ");
      } else {
        showToast(res.message || "ไม่สามารถบันทึกค่าใน Google Sheets ได้", "danger");
      }
    } else {
      appData.settings.defaultInterestPerDay = interest;
      appData.settings.defaultMinimumDays = minDays;
      saveLocalCache();
      showToast("บันทึกค่าเริ่มต้นจำลองสำเร็จ");
    }
  } catch (err) {
    console.error(err);
    showToast("เกิดข้อผิดพลาดในการดำเนินการ", "danger");
  } finally {
    hideLoading();
  }
}

function updateApiConnection() {
  const urlVal = document.getElementById("set-api-url").value.trim();
  
  if (urlVal === "") {
    // Revert to Mock Mode
    localStorage.removeItem("df_api_url");
    apiUrl = "";
    apiMode = false;
    
    const badge = document.getElementById("db-connection-badge");
    badge.innerText = "Mock Data";
    badge.className = "mode-badge mode-mock";
    
    loadMockData();
    refreshData();
    showToast("กลับเข้าสู่โหมดใช้งานข้อมูลจำลอง (Mock Data)");
  } else {
    // Test format
    if (!urlVal.startsWith("https://script.google.com/macros/s/")) {
      showToast("URL รูปแบบไม่ถูกต้อง ต้องขึ้นต้นด้วย Apps Script Web App URL", "danger");
      return;
    }
    
    localStorage.setItem("df_api_url", urlVal);
    apiUrl = urlVal;
    apiMode = true;
    
    const badge = document.getElementById("db-connection-badge");
    badge.innerText = "API Connected";
    badge.className = "mode-badge mode-api";
    
    refreshData();
    showToast("บันทึกช่องทางเชื่อมต่อ Google Sheets API แล้ว");
  }
}

// ==========================================
// BACKEND API CALL HANDLER (CORS Safe)
// ==========================================
async function callApi(action, data) {
  if (!apiUrl) return null;
  
  // Format body
  const bodyData = {
    action: action,
    data: data
  };
  
  try {
    // Send as text/plain to avoid browser sending preflight OPTIONS request
    // Google Apps Script doesn't respond well to preflight OPTIONS
    const response = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify(bodyData),
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    return json;
  } catch (e) {
    console.error("API Fetch Error:", e);
    throw e;
  }
}

// ==========================================
// UI LOADER CONTROLS
// ==========================================
function showLoading(text = "กำลังดำเนินการ...") {
  document.getElementById("loading-text").innerText = text;
  document.getElementById("loading-overlay").classList.add("active");
}

function hideLoading() {
  document.getElementById("loading-overlay").classList.remove("active");
}

// ==========================================
// STRING FORMATTING & HELPERS
// ==========================================
function formatDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatPhone(phone) {
  if (!phone) return "-";
  phone = phone.replace(/[-\s]/g, "");
  if (phone.length === 10) {
    return `${phone.substring(0, 3)}-${phone.substring(3, 6)}-${phone.substring(6)}`;
  } else if (phone.length === 9) {
    return `${phone.substring(0, 2)}-${phone.substring(2, 5)}-${phone.substring(5)}`;
  }
  return phone;
}

function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return "-";
  // Convert "YYYY-MM-DD HH:mm:ss" to Thai read format
  const parts = dateTimeStr.split(" ");
  const dateParts = parts[0].split("-");
  const timeStr = parts[1] ? parts[1].substring(0, 5) : "";
  
  if (dateParts.length === 3) {
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const yearThai = parseInt(dateParts[0]) + 543;
    const monthThai = months[parseInt(dateParts[1]) - 1];
    return `${parseInt(dateParts[2])} ${monthThai} ${String(yearThai).substring(2)} ${timeStr}`;
  }
  return dateTimeStr;
}

// Parse date string safely to local date object (ignores timezone offsets)
function parseDateString(dateStr) {
  if (!dateStr) return new Date();
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length === 3) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  return new Date(dateStr);
}

function getFrequencyUnitName(freq) {
  if (freq === "weekly") return "สัปดาห์";
  if (freq === "monthly") return "เดือน";
  return "วัน";
}

function getFrequencyInterestLabel(freq) {
  if (freq === "weekly") return "ดอกเบี้ยต่อสัปดาห์";
  if (freq === "monthly") return "ดอกเบี้ยต่อเดือน";
  return "ดอกเบี้ยต่อวัน";
}

function getFrequencyDueLabel(freq) {
  if (freq === "weekly") return "ดอกเก็บสัปดาห์นี้";
  if (freq === "monthly") return "ดอกเก็บเดือนนี้";
  return "ดอกเก็บวันนี้";
}

function getFrequencyMinDaysLabel(freq) {
  if (freq === "weekly") return "จำนวนสัปดาห์ขั้นต่ำ";
  if (freq === "monthly") return "จำนวนเดือนขั้นต่ำ";
  return "จำนวนวันขั้นต่ำ";
}

function isLoanDueOnDate(loan, dateStr) {
  const start = parseDateString(loan.loanDate);
  const target = parseDateString(dateStr);
  if (target <= start) return false;
  
  const freq = loan.paymentFrequency || "daily";
  const diffTime = target - start;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (freq === "daily") {
    return true;
  } else if (freq === "weekly") {
    return diffDays % 7 === 0;
  } else if (freq === "monthly") {
    const startDay = start.getDate();
    const targetDay = target.getDate();
    if (startDay === targetDay) return true;
    
    const lastDayOfTargetMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    if (startDay > lastDayOfTargetMonth && targetDay === lastDayOfTargetMonth) {
      return true;
    }
    return false;
  }
  return false;
}

// Calculate overdue info for a loan
function getLoanOverdueInfo(loan, targetDateStr = null) {
  if (!loan || loan.status !== "active") {
    return { isOverdue: false, overdueDays: 0, outstandingInterest: 0, elapsedDays: 0, expectedInterest: 0, totalInterestPaid: 0 };
  }

  // Use today's date if targetDateStr is not provided
  let today;
  if (targetDateStr) {
    today = parseDateString(targetDateStr);
  } else {
    today = new Date();
    today.setHours(0, 0, 0, 0);
  }

  const startDate = parseDateString(loan.loanDate);
  const freq = loan.paymentFrequency || "daily";
  
  // Calculate elapsed periods (exclusive of start date)
  let elapsedDays = 0; // representing elapsed periods
  if (today > startDate) {
    const diffTime = today - startDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (freq === "daily") {
      elapsedDays = diffDays;
    } else if (freq === "weekly") {
      elapsedDays = Math.floor(diffDays / 7);
    } else if (freq === "monthly") {
      let months = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
      const startDay = startDate.getDate();
      const todayDay = today.getDate();
      if (todayDay < startDay) {
        const lastDayOfTodayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        if (todayDay !== lastDayOfTodayMonth || startDay < lastDayOfTodayMonth) {
          months -= 1;
        }
      }
      elapsedDays = Math.max(0, months);
    }
  }

  // Calculate total interest paid so far for this loan
  const loanPayments = appData.payments.filter(p => p.loanId === loan.loanId);
  const totalInterestPaid = loanPayments.reduce((sum, p) => sum + parseFloat(p.interestPaid || 0), 0);

  // Expected interest up to today
  const expectedInterest = elapsedDays * loan.interestPerDay;

  // Outstanding interest (ทบดอก)
  const outstandingInterest = Math.max(0, expectedInterest - totalInterestPaid);

  // Overdue days: number of periods of interest that are unpaid
  const overdueDays = Math.ceil(outstandingInterest / loan.interestPerDay);
  const isOverdue = outstandingInterest > 0;

  return {
    isOverdue,
    overdueDays,
    outstandingInterest,
    elapsedDays,
    expectedInterest,
    totalInterestPaid
  };
}

const DEFAULT_AVATAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width: 55%; height: 55%; display: block; opacity: 0.85;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;

function getAvatarHtml(profileImage, extraStyles = "") {
  let styles = extraStyles;
  if (profileImage && (profileImage.startsWith("http") || profileImage.startsWith("data:image"))) {
    styles += (styles ? "; " : "") + `background-image: url('${profileImage}')`;
  }
  return styles ? `style="${styles}"` : "";
}

function getAvatarContent(profileImage) {
  if (profileImage && (profileImage.startsWith("http") || profileImage.startsWith("data:image"))) {
    return "";
  }
  return DEFAULT_AVATAR_SVG;
}

function clearSearch(inputId, searchType) {
  const input = document.getElementById(inputId);
  if (input) {
    input.value = "";
    if (searchType === 'debtors') {
      handleSearch("");
    } else if (searchType === 'payments') {
      handlePaymentsSearch("");
    } else if (searchType === 'overdue') {
      handleOverdueSearch("");
    }
    input.focus();
  }
}

// Expose functions to window for inline HTML event handlers (due to ES module scope in Vite build)
window.pressPin = pressPin;
window.clearPin = clearPin;
window.backspacePin = backspacePin;
window.switchReportTab = switchReportTab;
window.switchTab = switchTab;
window.switchDebtorFilter = switchDebtorFilter;
window.clearSearch = clearSearch;
window.toggleDebtorsLayout = toggleDebtorsLayout;
window.goBackToDebtors = goBackToDebtors;
window.switchDetailTab = switchDetailTab;
window.viewDocument = viewDocument;
window.switchPaymentsFilter = switchPaymentsFilter;
window.handlePaymentsSearch = handlePaymentsSearch;
window.togglePaymentsLayout = togglePaymentsLayout;
window.switchOverdueFilter = switchOverdueFilter;
window.handleOverdueSearch = handleOverdueSearch;
window.toggleOverdueLayout = toggleOverdueLayout;
window.updatePin = updatePin;
window.updateLoanDefaults = updateLoanDefaults;
window.updateApiConnection = updateApiConnection;
window.resetToMockData = resetToMockData;
window.logout = logout;
window.openAddDebtorSheet = openAddDebtorSheet;
window.submitAddDebtor = submitAddDebtor;
window.updateInterestFrequencyLabel = updateInterestFrequencyLabel;
window.triggerFileInput = triggerFileInput;
window.handleFileSelect = handleFileSelect;
window.removeUploadedFile = removeUploadedFile;
window.submitPayment = submitPayment;
window.calculatePaymentPreview = calculatePaymentPreview;
window.fillPayoffAmount = fillPayoffAmount;
window.closeSheet = closeSheet;
window.closeImageViewer = closeImageViewer;
window.handleReportDateChange = handleReportDateChange;
window.handleSearch = handleSearch;
window.openReceivePaymentModal = openReceivePaymentModal;
window.viewDebtorDetails = viewDebtorDetails;
