/**
 * Ideakicks Waitlist - Secure Form Controller
 */

// ─── Google Sheets Web App Endpoint ───────────────────────────────────────────
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzVcuoMD_zwQT_wxapzhKiiYFFB9CGPkyBidVQOY1QTTWrVQS4yKdcfFN9b8vBLXVUP/exec";

// Local storage backup key
const STORAGE_BACKUP_KEY = "ideakicks_waitlist_submissions";

// Anti-spam cooldown key
const LAST_SUBMIT_KEY = "ideakicks_last_submit_ts";
const COOLDOWN_SECONDS = 5;

// ─── DOM References ───────────────────────────────────────────────────────────
const form = document.getElementById("waitlist-form");
const submitBtn = document.getElementById("submit-btn");
const btnLabel = submitBtn.querySelector(".btn-label");
const btnSpinner = submitBtn.querySelector(".btn-spinner");
const errorBanner = document.getElementById("error-banner");

const confirmedState = document.getElementById("confirmed-state");
const confirmedName = document.getElementById("confirmed-name");
const resetBtn = document.getElementById("reset-btn");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const excitementInput = document.getElementById("excitement");

// ─── Input Sanitization & Security ─────────────────────────────────────────────
function sanitizeText(input, maxLength = 800) {
  if (typeof input !== "string") return "";
  
  // Strip any HTML tags or script injection attempts
  let clean = input.replace(/<[^>]*>/g, "");
  
  // Normalize whitespace
  clean = clean.replace(/[\r\n\t]+/g, " ").trim();
  
  // Cut to maximum allowed length
  return clean.slice(0, maxLength);
}

function validateEmail(email) {
  // RFC 5322 compliant regex for safe email checking
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email) && email.length <= 120;
}

function validatePhone(phone) {
  // Extract only numbers and check length
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= 8 && digitsOnly.length <= 15;
}

function showError(message, inputElement = null) {
  errorBanner.textContent = message;
  errorBanner.style.display = "block";
  errorBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // Clear previous error styles
  [nameInput, emailInput, phoneInput, excitementInput].forEach((el) => {
    el.classList.remove("has-error");
  });

  if (inputElement) {
    inputElement.classList.add("has-error");
    inputElement.focus();
  }
}

function clearError() {
  errorBanner.textContent = "";
  errorBanner.style.display = "none";
  [nameInput, emailInput, phoneInput, excitementInput].forEach((el) => {
    el.classList.remove("has-error");
  });
}

// ─── Form Submission Event ─────────────────────────────────────────────────────
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  // 1. Anti-Bot Honeypot Check
  const honeypot = document.getElementById("_hp_security_check");
  if (honeypot && honeypot.value.trim() !== "") {
    // Silently drop bot submission
    showConfirmed("Friend");
    return;
  }

  // 2. Anti-Spam Rate Limiting Check
  const lastSubmit = sessionStorage.getItem(LAST_SUBMIT_KEY);
  const now = Date.now();
  if (lastSubmit && now - parseInt(lastSubmit, 10) < COOLDOWN_SECONDS * 1000) {
    showError("Please wait a few seconds before submitting again.");
    return;
  }

  // 3. Extract and Sanitize Inputs
  const rawName = nameInput.value;
  const rawEmail = emailInput.value;
  const rawPhone = phoneInput.value;
  const rawExcitement = excitementInput.value;

  const name = sanitizeText(rawName, 80);
  const email = rawEmail.trim().toLowerCase();
  const phone = sanitizeText(rawPhone, 20);
  const excitement = sanitizeText(rawExcitement, 800);

  // 4. Strict Validation
  if (!name || name.length < 2) {
    showError("Please enter your full name (at least 2 characters).", nameInput);
    return;
  }

  if (!validateEmail(email)) {
    showError("Please enter a valid email address (e.g. name@domain.com).", emailInput);
    return;
  }

  if (!validatePhone(phone)) {
    showError("Please enter a valid phone number with country code (at least 8 digits).", phoneInput);
    return;
  }

  if (!excitement || excitement.length < 5) {
    showError("Please tell us what excites you most about Ideakicks (at least 5 characters).", excitementInput);
    return;
  }

  // 5. Submit Execution
  setSubmitting(true);
  sessionStorage.setItem(LAST_SUBMIT_KEY, String(now));

  const payload = {
    timestamp: new Date().toISOString(),
    name,
    email,
    phone,
    excitement,
  };

  // Always save backup locally first
  saveLocalBackup(payload);

  // Send to Google Sheets Web App
  if (GOOGLE_SHEET_URL) {
    try {
      const postData = new FormData();
      postData.append("name", name);
      postData.append("email", email);
      postData.append("phone", phone);
      postData.append("excitement", excitement);

      await fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        body: postData,
      });
    } catch (err) {
      console.warn("Network notice (entry safely preserved in backup):", err);
    }
  }

  // Trigger celebration confetti
  triggerConfetti();

  // Show confirmed success screen
  setSubmitting(false);
  showConfirmed(name);
});

// ─── Reset Button Event ────────────────────────────────────────────────────────
resetBtn.addEventListener("click", () => {
  form.reset();
  clearError();
  confirmedState.style.display = "none";
  form.style.display = "flex";
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ─── Helpers ───────────────────────────────────────────────────────────────────
function setSubmitting(isSending) {
  submitBtn.disabled = isSending;
  if (isSending) {
    btnLabel.textContent = "Securing your spot...";
    btnSpinner.style.display = "inline-block";
  } else {
    btnLabel.textContent = "Join Priority Waitlist →";
    btnSpinner.style.display = "none";
  }
}

function showConfirmed(displayName) {
  confirmedName.textContent = displayName;
  form.style.display = "none";
  confirmedState.style.display = "flex";
  confirmedState.scrollIntoView({ behavior: "smooth", block: "center" });
}

function saveLocalBackup(data) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_BACKUP_KEY) || "[]");
    existing.unshift(data);
    localStorage.setItem(STORAGE_BACKUP_KEY, JSON.stringify(existing));
  } catch (e) {
    // Ignore storage quota errors
  }
}

function triggerConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 85,
      spread: 68,
      origin: { y: 0.6 },
      colors: ["#6FD179", "#082D4D", "#2A7A37", "#38BDF8"],
    });
  }
}
