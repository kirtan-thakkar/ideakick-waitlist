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
  
  // Prevent Spreadsheet Formula Injection (neutralize leading =, +, -, @)
  if (/^[=+\-@]/.test(clean)) {
    clean = "'" + clean;
  }

  // Cut to maximum allowed length
  return clean.slice(0, maxLength);
}

function validateEmail(email) {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim().toLowerCase();
  
  if (trimmed.length < 5 || trimmed.length > 100) return false;
  
  // Block spaces, consecutive dots, leading or trailing dots
  if (trimmed.includes(" ") || trimmed.includes("..") || trimmed.startsWith(".") || trimmed.endsWith(".")) {
    return false;
  }
  
  // Strict RFC format: requires username, @, domain name, and valid 2+ letter alphabetic TLD
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;
  return emailRegex.test(trimmed);
}

function validatePhone(phone) {
  if (!phone || typeof phone !== "string") return false;
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

function showError(message, inputElement = null, shouldScroll = true) {
  errorBanner.textContent = message;
  errorBanner.style.display = "block";

  // Clear previous error styles
  [nameInput, emailInput, phoneInput, excitementInput].forEach((el) => {
    el.classList.remove("has-error");
  });

  if (inputElement) {
    inputElement.classList.add("has-error");
    if (shouldScroll) {
      errorBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
      inputElement.focus();
    }
  }
}

function clearError() {
  errorBanner.textContent = "";
  errorBanner.style.display = "none";
  [nameInput, emailInput, phoneInput, excitementInput].forEach((el) => {
    el.classList.remove("has-error");
  });
}

// ─── Real-Time Phone Restriction (Strict Numbers Only) ─────────────────────────
phoneInput.addEventListener("keydown", (e) => {
  // Allow control / navigation keys
  const allowed = [
    "Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
    "Tab", "Enter", "Escape", "Home", "End"
  ];
  if (allowed.includes(e.key)) return;

  // Allow standard shortcuts (Ctrl/Cmd + A, C, V, X, Z)
  if (e.ctrlKey || e.metaKey) return;

  // Allow '+' only at position 0 if not already present
  if (e.key === "+") {
    if (phoneInput.selectionStart === 0 && !phoneInput.value.includes("+")) {
      return;
    }
    e.preventDefault();
    return;
  }

  // Allow only digits 0-9
  if (/^[0-9]$/.test(e.key)) {
    const digitsOnly = phoneInput.value.replace(/\D/g, "");
    const isSelectionReplacing = phoneInput.selectionStart !== phoneInput.selectionEnd;
    // Cap at 15 digits
    if (digitsOnly.length >= 15 && !isSelectionReplacing) {
      e.preventDefault();
    }
    return;
  }

  // Block any non-digit character (letters, spaces, punctuation, symbols)
  e.preventDefault();
});

phoneInput.addEventListener("input", (e) => {
  const raw = e.target.value;
  const hasLeadingPlus = raw.startsWith("+");
  
  // Strip everything except numbers
  let digits = raw.replace(/\D/g, "");
  if (digits.length > 15) {
    digits = digits.slice(0, 15);
  }
  
  e.target.value = hasLeadingPlus ? "+" + digits : digits;

  // Auto clear error state when input reaches valid length
  if (phoneInput.classList.contains("has-error") && digits.length >= 10) {
    phoneInput.classList.remove("has-error");
    clearError();
  }
});

phoneInput.addEventListener("blur", () => {
  const val = phoneInput.value.trim();
  if (val && !validatePhone(val)) {
    showError("Please enter a valid phone number (at least 10 digits).", phoneInput, false);
  }
});

// ─── Real-Time Email Validation & Feedback ─────────────────────────────────────
emailInput.addEventListener("input", () => {
  if (emailInput.classList.contains("has-error") && validateEmail(emailInput.value)) {
    emailInput.classList.remove("has-error");
    clearError();
  }
});

emailInput.addEventListener("blur", () => {
  const val = emailInput.value.trim();
  if (val && !validateEmail(val)) {
    showError("Please enter a valid email address (e.g. name@domain.com).", emailInput, false);
  }
});

// ─── Real-Time Feedback for Other Fields ───────────────────────────────────────
nameInput.addEventListener("input", () => {
  if (nameInput.classList.contains("has-error") && nameInput.value.trim().length >= 2) {
    nameInput.classList.remove("has-error");
    clearError();
  }
});

excitementInput.addEventListener("input", () => {
  if (excitementInput.classList.contains("has-error") && excitementInput.value.trim().length >= 5) {
    excitementInput.classList.remove("has-error");
    clearError();
  }
});

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
    showError("Please wait a few seconds before submitting again.", null, true);
    return;
  }

  // 3. Extract and Sanitize Inputs
  const rawName = nameInput.value;
  const rawEmail = emailInput.value;
  const rawPhone = phoneInput.value;
  const rawExcitement = excitementInput.value;

  const name = sanitizeText(rawName, 80);
  const email = rawEmail.trim().toLowerCase();
  const phone = rawPhone.trim();
  const excitement = sanitizeText(rawExcitement, 800);

  // 4. Strict Validation
  if (!name || name.length < 2) {
    showError("Please enter your full name (at least 2 characters).", nameInput, true);
    return;
  }

  if (!validateEmail(email)) {
    showError("Please enter a valid email address (e.g. name@domain.com).", emailInput, true);
    return;
  }

  if (!validatePhone(phone)) {
    showError("Please enter a valid phone number (at least 10 digits).", phoneInput, true);
    return;
  }

  if (!excitement || excitement.length < 5) {
    showError("Please tell us what excites you most about Ideakicks (at least 5 characters).", excitementInput, true);
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
