/**
 * ============================================================================
 * IDEAKICKS - GOOGLE APPS SCRIPT WEB APP (UPDATED FIELDS)
 * ============================================================================
 * 
 * If you ever need to re-paste into Code.gs, this handles:
 * - Timestamp
 * - Full Name
 * - Email Address
 * - Phone / WhatsApp
 * - What Excites You Most About Ideakicks
 * ============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Auto-create header row on empty sheet
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Full Name",
        "Email Address",
        "Phone / WhatsApp",
        "What Excites You Most"
      ]);
      
      var headerRange = sheet.getRange(1, 1, 1, 5);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#082D4D");
      headerRange.setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }

    var data = {};
    if (e.parameter && Object.keys(e.parameter).length > 0) {
      data = e.parameter;
    } else if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = {};
      }
    }

    var timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    var name = data.name || "";
    var email = data.email || "";
    var phone = data.phone || "";
    var excitement = data.excitement || "";

    // Append lead row
    sheet.appendRow([
      timestamp,
      name,
      email,
      phone,
      excitement
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput("Ideakicks Waitlist API is active.")
    .setMimeType(ContentService.MimeType.TEXT);
}
