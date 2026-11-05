/**
 * ============================================================================
 * IDEAKICKS - GOOGLE APPS SCRIPT FOR CREATOR WAITLIST
 * ============================================================================
 * 
 * Follow these 5 quick steps to connect your form to Google Sheets (takes 2 minutes):
 * 
 * 1. Open Google Sheets (https://sheets.google.com) and create a new blank spreadsheet.
 *    Name it e.g. "Ideakicks Creator Waitlist".
 * 
 * 2. In the top menu, click: Extensions > Apps Script.
 * 
 * 3. Delete any code currently in Code.gs, paste this ENTIRE file into it, and click "Save" (disk icon).
 * 
 * 4. Click the blue "Deploy" button (top right) > "New deployment".
 *    - Click the gear icon (Select type) > Choose "Web app".
 *    - Description: "Creator Waitlist Web App"
 *    - Execute as: "Me (your email)"
 *    - Who has access: "Anyone" (IMPORTANT: select Anyone so form can submit without login).
 *    - Click "Deploy".
 *    - (If prompted, click "Authorize access", choose your Google account, click "Advanced", and "Go to Untitled project (unsafe)").
 * 
 * 5. Copy the generated "Web App URL" (ends in /exec).
 *    Open script.js and paste it into:
 *    const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/YOUR_ID/exec";
 * 
 * Done! Every time a creator submits, a new row appears in your Google Sheet immediately.
 * ============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Auto-create header row if sheet is fresh
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Full Name",
        "Email Address",
        "Phone / WhatsApp",
        "Project Name",
        "Prototype Stage",
        "Details / Pitch / Link"
      ]);
      
      // Style header row
      var headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#082D4D");
      headerRange.setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }

    // Parse incoming data (handles both FormData and JSON)
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
    var projectName = data.project_name || "";
    var stage = data.stage || "";
    var details = data.details || "";

    // Append new lead
    sheet.appendRow([
      timestamp,
      name,
      email,
      phone,
      projectName,
      stage,
      details
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", name: name }))
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
    .createTextOutput("Ideakicks Creator Waitlist API is active.")
    .setMimeType(ContentService.MimeType.TEXT);
}
