/**
 * DebtFlow - Google Apps Script Backend (API)
 * 
 * วิธีการใช้งาน:
 * 1. สร้าง Google Sheets ใหม่ขึ้นมาหนึ่งอัน
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) -> "แอปสคริปต์" (Apps Script)
 * 3. คัดลอกโค้ดทั้งหมดนี้ไปวางในไฟล์รหัสกู้ยืมหลัก (เช่น Code.gs หรือ backend.gs)
 * 4. กดบันทึก และกดปุ่ม "การทำให้ใช้งานได้" (Deploy) -> "การทำให้ใช้งานได้ใหม่" (New Deployment)
 * 5. เลือกประเภทการจัดจำหน่ายเป็น "เว็บแอป" (Web App)
 * 6. ตั้งค่าการเข้าถึงเป็น "ทุกคน" (Anyone) และเรียกใช้แอปในฐานะตัวคุณเอง
 * 7. คัดลอก URL เว็บแอปที่ได้ ไปวางในเมนู "ตั้งค่า" ของ DebtFlow Web App
 */

// ==========================================
// CORE API ROUTING
// ==========================================

function doGet(e) {
  // ===== API HANDLER via GET (แก้ปัญหา CORS redirect) =====
  if (e && e.parameter && e.parameter.payload) {
    try {
      initSheets();
      const requestData = JSON.parse(e.parameter.payload);
      const action = requestData.action;
      const payload = requestData.data;
      
      let result = { success: false, message: "Action not found" };
      
      switch (action) {
        case "login":
          result = handleLogin(payload.pin);
          break;
        case "getInitialData":
          result = handleGetInitialData();
          break;
        case "addDebtor":
          result = handleAddDebtor(payload.debtor, payload.loan, payload.files);
          break;
        case "receivePayment":
          result = handleReceivePayment(
            payload.payment,
            payload.loanId,
            payload.debtorId,
            payload.newRemainingPrincipal,
            payload.isCompleted
          );
          break;
        case "updateSettings":
          result = handleUpdateSettings(payload.defaultInterestPerDay, payload.defaultMinimumDays);
          break;
        case "updatePin":
          result = handleUpdatePin(payload.oldPin, payload.newPin);
          break;
      }
      
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
        
    } catch (error) {
      const errorResult = { success: false, message: "System Error: " + error.toString() };
      return ContentService.createTextOutput(JSON.stringify(errorResult))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // ===== STATUS PAGE (เปิด URL ตรงๆ ใน browser) =====
  return HtmlService.createHtmlOutput(
    "<div style='font-family: sans-serif; text-align: center; padding: 40px; color: #1F2937;'>" +
    "<h2 style='color: #C98B6F;'>DebtFlow API is Running Successfully</h2>" +
    "<p style='color: #6B7280;'>ระบบฐานข้อมูล Google Sheets ของท่านออนไลน์แล้ว</p>" +
    "<p style='font-size: 14px; background: #F3F4F6; padding: 10px; border-radius: 8px; max-width: 500px; margin: 20px auto; word-break: break-all;'>" +
    "กรุณาคัดลอก URL ของหน้าเว็บนี้ไปวางในเมนู <b>'ตั้งค่า'</b> ของแอปพลิเคชัน</p>" +
    "</div>"
  );
}

function doPost(e) {
  // รองรับ CORS
  const responseHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  
  try {
    // เตรียมสร้างฐานข้อมูล (ถ้ายังไม่มี)
    initSheets();
    
    // แปลงข้อมูลคำขอ
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    const payload = requestData.data;
    
    let result = { success: false, message: "Action not found" };
    
    switch (action) {
      case "login":
        result = handleLogin(payload.pin);
        break;
        
      case "getInitialData":
        result = handleGetInitialData();
        break;
        
      case "addDebtor":
        result = handleAddDebtor(payload.debtor, payload.loan, payload.files);
        break;
        
      case "receivePayment":
        result = handleReceivePayment(
          payload.payment, 
          payload.loanId, 
          payload.debtorId, 
          payload.newRemainingPrincipal, 
          payload.isCompleted
        );
        break;
        
      case "updateSettings":
        result = handleUpdateSettings(payload.defaultInterestPerDay, payload.defaultMinimumDays);
        break;
        
      case "updatePin":
        result = handleUpdatePin(payload.oldPin, payload.newPin);
        break;
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    const errorResult = { success: false, message: "System Error: " + error.toString() };
    return ContentService.createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// BUSINESS HANDLERS
// ==========================================

function handleLogin(enteredPin) {
  const settings = getSettings();
  if (settings.pinCode === String(enteredPin)) {
    return { success: true };
  } else {
    return { success: false, message: "รหัส PIN ไม่ถูกต้อง" };
  }
}

function handleGetInitialData() {
  return {
    success: true,
    data: {
      settings: getSettings(),
      debtors: getTableData("Debtors"),
      loans: getTableData("Loans"),
      payments: getTableData("Payments")
    }
  };
}

function handleAddDebtor(debtorObj, loanObj, files) {
  // บันทึกรูปภาพลง Google Drive (ถ้ามีการอัปโหลดมา)
  if (files) {
    if (files.idcard) {
      debtorObj.idCardImage = saveBase64File(files.idcard, "id-cards");
    }
    if (files.housereg) {
      debtorObj.houseRegistrationImage = saveBase64File(files.housereg, "house-registrations");
    }
    if (files.house) {
      debtorObj.houseImage = saveBase64File(files.house, "houses");
    }
    if (files.profile) {
      debtorObj.profileImage = saveBase64File(files.profile, "profiles");
    }
  }
  
  // บันทึกลูกหนี้
  appendRow("Debtors", debtorObj);
  
  // บันทึกสัญญาเงินกู้
  appendRow("Loans", loanObj);
  
  return { success: true, message: "สร้างสัญญาและข้อมูลลูกหนี้เรียบร้อย" };
}

function handleReceivePayment(paymentObj, loanId, debtorId, newRemaining, isCompleted) {
  // 1. บันทึกประวัติการชำระเงิน
  appendRow("Payments", paymentObj);
  
  // 2. อัปเดตเงินต้นคงเหลือในสัญญา
  updateRowValue("Loans", "loanId", loanId, {
    remainingPrincipal: newRemaining,
    status: isCompleted ? "completed" : "active"
  });
  
  // 3. หากชำระครบแล้ว ให้ปิดสถานะของลูกหนี้เมื่อไม่มีสัญญากู้อื่นที่ยังค้างชำระอยู่
  if (isCompleted) {
    const loans = getTableData("Loans");
    const hasOtherActiveLoans = loans.some(function(l) {
      return l.debtorId === debtorId && l.loanId !== loanId && l.status === "active" && Number(l.remainingPrincipal) > 0;
    });
    if (!hasOtherActiveLoans) {
      updateRowValue("Debtors", "debtorId", debtorId, {
        status: "closed"
      });
    }
  }
  
  return { success: true, message: "บันทึกการชำระเงินเรียบร้อย" };
}

function handleUpdateSettings(interest, minDays) {
  updateSettingsRow({
    defaultInterestPerDay: interest,
    defaultMinimumDays: minDays
  });
  return { success: true, message: "อัปเดตค่าเริ่มต้นการตั้งค่าแล้ว" };
}

function handleUpdatePin(oldPin, newPin) {
  const settings = getSettings();
  if (settings.pinCode !== String(oldPin)) {
    return { success: false, message: "รหัส PIN เดิมไม่ถูกต้อง" };
  }
  
  updateSettingsRow({
    pinCode: newPin
  });
  return { success: true, message: "เปลี่ยนรหัส PIN เรียบร้อยแล้ว" };
}

// ==========================================
// DATABASE (SPREADSHEETS) UTILITIES
// ==========================================

const SHEET_HEADERS = {
  Debtors: [
    "debtorId", "fullName", "phone", "nationalId", "address", "occupation", 
    "facebook", "lineId", "googleMap", "note", "status", "idCardImage", 
    "houseRegistrationImage", "houseImage", "profileImage", "createdAt"
  ],
  Loans: [
    "loanId", "debtorId", "loanDate", "principal", "remainingPrincipal", 
    "interestPerDay", "minimumDays", "status", "paymentFrequency", "createdAt"
  ],
  Payments: [
    "paymentId", "loanId", "paymentDate", "amount", "interestPaid", 
    "principalPaid", "remainingPrincipal", "createdAt"
  ],
  Settings: [
    "defaultInterestPerDay", "defaultMinimumDays", "pinCode"
  ]
};

function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // สร้างตารางข้อมูลต่างๆ หากไม่มีอยู่จริง
  for (let sheetName in SHEET_HEADERS) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // เขียนหัวตาราง (Headers)
      sheet.appendRow(SHEET_HEADERS[sheetName]);
      if (sheetName === "Settings") {
        sheet.appendRow([100, 5, "1234"]);
      }
    } else {
      // Auto-migrate: check if columns are missing and append them
      const data = sheet.getDataRange().getValues();
      if (data.length > 0) {
        const currentHeaders = data[0];
        const expectedHeaders = SHEET_HEADERS[sheetName];
        expectedHeaders.forEach(h => {
          if (currentHeaders.indexOf(h) === -1) {
            // Write new header column
            sheet.getRange(1, currentHeaders.length + 1).setValue(h);
            currentHeaders.push(h);
          }
        });
      }
    }
  }
}

function getSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Settings");
  const data = sheet.getDataRange().getValues();
  
  // ถ้าไม่มีแถวข้อมูล ให้กลับค่าเริ่มต้น
  if (data.length <= 1) {
    return { defaultInterestPerDay: 100, defaultMinimumDays: 5, pinCode: "1234" };
  }
  
  const headers = data[0];
  const values = data[1];
  
  const settings = {};
  headers.forEach((h, idx) => {
    settings[h] = values[idx];
  });
  
  return settings;
}

function getTableData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = [];
  
  for (let i = 1; i < data.length; i++) {
    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = data[i][idx];
    });
    rows.push(rowObj);
  }
  
  return rows;
}

function appendRow(sheetName, dataObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const headers = SHEET_HEADERS[sheetName];
  
  const rowValues = headers.map(h => {
    return dataObj[h] !== undefined ? dataObj[h] : "";
  });
  
  sheet.appendRow(rowValues);
}

function updateRowValue(sheetName, keyColumn, keyValue, updateObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const keyIdx = headers.indexOf(keyColumn);
  if (keyIdx === -1) return;
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][keyIdx]) === String(keyValue)) {
      // ทำการอัปเดตช่องที่ระบุ
      for (let key in updateObj) {
        const colIdx = headers.indexOf(key);
        if (colIdx !== -1) {
          sheet.getRange(i + 1, colIdx + 1).setValue(updateObj[key]);
        }
      }
      break;
    }
  }
}

function updateSettingsRow(updateObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Settings");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let key in updateObj) {
    const colIdx = headers.indexOf(key);
    if (colIdx !== -1) {
      sheet.getRange(2, colIdx + 1).setValue(updateObj[key]);
    }
  }
}

// ==========================================
// FILE STORAGE (GOOGLE DRIVE) UTILITIES
// ==========================================

function getOrCreateParentFolder() {
  const folderName = "DebtFlow";
  const parentFolders = DriveApp.getFoldersByName(folderName);
  
  if (parentFolders.hasNext()) {
    return parentFolders.next();
  } else {
    return DriveApp.createFolder(folderName);
  }
}

function getOrCreateSubFolder(subFolderName, parentFolder) {
  const subFolders = parentFolder.getFoldersByName(subFolderName);
  
  if (subFolders.hasNext()) {
    return subFolders.next();
  } else {
    const newFolder = parentFolder.createFolder(subFolderName);
    // ตั้งค่าแชร์ให้ทุกคนเปิดผ่านลิงก์ได้โดยไม่ต้องเข้าสู่ระบบ เพื่อพรีวิวในหน้าแอป
    newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return newFolder;
  }
}

function saveBase64File(fileObj, subFolderName) {
  if (!fileObj || !fileObj.base64) return "";
  
  const parentFolder = getOrCreateParentFolder();
  const subFolder = getOrCreateSubFolder(subFolderName, parentFolder);
  
  // แปลง base64 เป็น Blob
  const decoded = Utilities.base64Decode(fileObj.base64);
  
  // ตั้งชื่อไฟล์ใหม่ด้วย timestamp ป้องกันการซ้ำ
  const timestamp = new Date().getTime();
  const sanitizedFileName = timestamp + "_" + fileObj.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
  
  const blob = Utilities.newBlob(decoded, fileObj.mimeType, sanitizedFileName);
  const file = subFolder.createFile(blob);
  
  // ตั้งแชร์ระดับดูได้ทุกคน สำหรับลิงก์รูปภาพ
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  // คืนค่า Direct Thumbnail URL (sz=w1000 เพื่อความละเอียดชัดเจน)
  return "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1000";
}
