/**
 * Ideakicks - Founding Creator Waitlist Form Controller
 * 
 * Instructions to connect Google Sheets:
 * 1. Follow the steps in google-sheets-script.js to deploy your Google Apps Script Web App.
 * 2. Paste your Web App URL into the GOOGLE_SHEET_URL variable below.
 * 3. That's it! Every submission will write to your Google Sheet in real-time.
 */

// ─── Configuration ─────────────────────────────────────────────────────────────
// Replace this with your Google Apps Script Web App URL
const GOOGLE_SHEET_URL = ""; 

// Local storage backup key
const STORAGE_BACKUP_KEY = "ideakicks_creator_submissions";

// ─── DOM Elements ──────────────────────────────────────────────────────────────
const form = document.getElementById("creator-form");
const submitBtn = document.getElementById("submit-btn");
const btnText = submitBtn.querySelector(".btn-text");
const btnSpinner = submitBtn.querySelector(".btn-spinner");

const successState = document.getElementById("success-state");
const successName = document.getElementById("success-name");
const successProject = document.getElementById("success-project");
const resetBtn = document.getElementById("reset-btn");

// ─── Form Submission Handler ───────────────────────────────────────────────────
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const name = formData.get("name")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const phone = formData.get("phone")?.toString().trim() || "";
  const projectName = formData.get("project_name")?.toString().trim() || "";
  const stage = formData.get("stage")?.toString() || "Concept / Idea";
  const details = formData.get("details")?.toString().trim() || "";

  // Validation
  if (!name) {
    alert("Please enter your full name.");
    return;
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  if (!phone || phone.replace(/\D/g, "").length < 8) {
    alert("Please enter a valid phone number with at least 8 digits.");
    return;
  }

  if (!projectName) {
    alert("Please enter your project or product name.");
    return;
  }

  // Set loading state
  setLoading(true);

  const payload = {
    timestamp: new Date().toISOString(),
    name,
    email,
    phone,
    project_name: projectName,
    stage,
    details,
  };

  // 1. Always back up lead locally first
  saveToLocalStorage(payload);

  // 2. Submit to Google Sheets (if URL configured)
  if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
    try {
      // Use FormData with no-cors to prevent browser CORS preflight blocking on Google Apps Script
      const postData = new FormData();
      Object.keys(payload).forEach((key) => {
        postData.append(key, payload[key]);
      });

      await fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        body: postData,
      });
    } catch (err) {
      console.warn("Google Sheets network sync note:", err);
      // We continue to success screen since local backup is stored
    }
  } else {
    console.info("Google Sheets URL not configured yet. Lead has been saved to browser localStorage.");
  }

  // 3. Trigger celebration confetti
  triggerConfetti();

  // 4. Show success screen
  setLoading(false);
  showSuccess(name, projectName);
});

// ─── Reset Button Handler ──────────────────────────────────────────────────────
resetBtn.addEventListener("click", () => {
  form.reset();
  successState.style.display = "none";
  form.style.display = "flex";
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ─── Helpers ───────────────────────────────────────────────────────────────────
function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  if (isLoading) {
    btnText.textContent = "Submitting application...";
    btnSpinner.style.display = "inline-block";
  } else {
    btnText.textContent = "Apply for Founding Creator Cohort →";
    btnSpinner.style.display = "none";
  }
}

function showSuccess(name, projectName) {
  successName.textContent = name;
  successProject.textContent = projectName;
  form.style.display = "none";
  successState.style.display = "flex";
  successState.scrollIntoView({ behavior: "smooth", block: "center" });
}

function saveToLocalStorage(data) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_BACKUP_KEY) || "[]");
    existing.unshift(data);
    localStorage.setItem(STORAGE_BACKUP_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error("Local storage error:", err);
  }
}

function triggerConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6FD179", "#082D4D", "#2A7A37", "#98E69E"],
    });
  }
}
