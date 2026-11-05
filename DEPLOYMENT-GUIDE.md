# Ideakicks Creator Waitlist — Deployment & Setup Guide

This project is a 100% lightweight, standalone static website built in pure **HTML, CSS, and JavaScript**. 
It requires **no build step, no Node server, and zero dependencies**.

---

## Part 1: Connect to Google Sheets (2 Minutes)

1. Open **[Google Sheets](https://sheets.google.com)** and create a new blank spreadsheet (e.g. name it `Ideakicks Creator Waitlist`).
2. In the top menu, go to **Extensions > Apps Script**.
3. Delete any default code in the editor, copy the entire contents of `google-sheets-script.js`, and paste it in.
4. Click the **Save** icon (disk icon).
5. Click **Deploy (blue button top-right) > New deployment**:
   - Click the gear icon next to "Select type" and select **Web app**.
   - Description: `Creator Waitlist`
   - Execute as: `Me (your email)`
   - **Who has access: `Anyone`** *(Important: Must be 'Anyone' so the website can submit without requiring Google sign-in).*
   - Click **Deploy**.
   - If prompted with "Authorization required", click **Authorize access** > choose your Google account > click **Advanced** > click **Go to Untitled project (unsafe)** > click **Allow**.
6. Copy the **Web App URL** (looks like: `https://script.google.com/macros/s/AKfycbx.../exec`).
7. Open `script.js` and paste your URL on line 12:
   ```javascript
   const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbx.../exec";
   ```
8. Save `script.js`. Done! Every submission now appends directly to your Google Sheet in real-time.

---

## Part 2: How to Deploy to Hostinger (`ideakicks.com`)

Since you already have the domain `ideakicks.com` in Hostinger, you can deploy in either of two ways:

### Option A: Direct Hostinger File Manager (Fastest — 30 Seconds)
1. Log in to your **Hostinger Control Panel (hPanel)**.
2. Go to **Websites** > find `ideakicks.com` > click **Manage**.
3. In the search bar or under Files, click **File Manager** (Access files of `ideakicks.com`).
4. Double-click to open the `public_html` folder.
5. Upload the following files directly inside `public_html`:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `logo-mark.svg`
6. *(Optional)* If there is a default Hostinger `default.php` file in `public_html`, delete or rename it so `index.html` loads as the root page.
7. Open `https://ideakicks.com` in your browser. Your waitlist page is live with SSL!

---

### Option B: Deploy via GitHub (Auto-updates when you push code)
1. Initialize git in this folder and push to a new GitHub repo:
   ```bash
   cd C:\ideakicks\ideakicks-creator-waitlist
   git init
   git add .
   git commit -m "initial creator waitlist release"
   git remote add origin https://github.com/kirtan-thakkar/ideakicks-creator-waitlist.git
   git push -u origin main
   ```
2. In Hostinger hPanel:
   - Go to **Advanced > Git**.
   - Repository URL: `https://github.com/kirtan-thakkar/ideakicks-creator-waitlist.git`
   - Branch: `main`
   - Directory: `public_html`
   - Click **Create & Deploy**.
   - Whenever you push new code to GitHub, click **Deploy** in Hostinger to update instantly.

---

### Option C: Deploy via Vercel/Cloudflare Pages + Hostinger DNS (Zero server load)
1. Push this repo to GitHub.
2. Go to **[Vercel.com](https://vercel.com)** > Click **Add New Project** > Import `ideakicks-creator-waitlist` > Click **Deploy** (takes 10 seconds).
3. In Vercel Project Settings > **Domains** > add `ideakicks.com`.
4. In Hostinger hPanel > **DNS Zone**:
   - Point your `@` A record to `76.76.21.21` (Vercel IP), or `www` CNAME to `cname.vercel-dns.com`.
5. Done! Global CDN, automatic HTTPS SSL certificate, and 100% uptime.

---

## Testing Locally Before Deploying

To preview locally right now:
- Simply double-click `index.html` in Windows File Explorer, or open it with Chrome/Edge.
- Or run any local static server:
  ```bash
  npx serve C:\ideakicks\ideakicks-creator-waitlist
  ```
