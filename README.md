# 🛡️ Privacy-First, Risk-Based Identity Trust Framework

A production-ready full-stack prototype designed for the **Bank of Baroda Hackathon**. This application implements an **adaptive authentication architecture** that dynamically adjusts security boundaries and multi-factor checkpoints depending on real-time client risk vectors and behaviors.

All components are presented inside a **Cyberpunk Dark Operations Console**, built with modern design principles (glassmorphism, interactive circular gauges, dark data charts).

---

## 🏗️ Directory Structure

```
BOB/
├── backend/
│   ├── package.json         # Node.js dependencies & nodemon
│   └── server.js            # Express server handling OTP, transaction validation, & telemetry
├── frontend/
│   ├── package.json         # Vite + React setup
│   ├── tailwind.config.js   # Custom cyberpunk theme definitions
│   ├── postcss.config.js    # PostCSS configs with Tailwind CSS v4 support
│   ├── index.html           # Font pre-connects and SEO metadata
│   └── src/
│       ├── main.jsx         # React DOM mount script
│       ├── App.jsx          # Main client router, state manager, & step-up triggers
│       ├── index.css        # Global CSS classes, glassmorphism, & glow animations
│       ├── utils/
│       │   └── api.js       # Unified fetch handlers for communication with backend
│       └── components/
│           ├── LoginCard.jsx   # Auth UI (Email Submission -> 4-Digit OTP Grid)
│           ├── Dashboard.jsx   # Profile details, Metadata Grid, & Circular Trust Gauge
│           ├── RiskEngine.jsx  # Interactive risk vector selector toggles
│           ├── StepUpModal.jsx # Overlay Transaction OTP modal for secure actions
│           └── AdminPanel.jsx  # Security Ops dashboard, threat line charts, & edge logs
├── start.bat                # Concurrent launcher script for Windows
└── README.md                # System documentation
```

---

## ⚡ Quick Start

### 📋 Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 🚀 Running the Project
Simply double-click the **`start.bat`** file in the root folder. 

This script will concurrently open:
1. A console launching the **Backend Service** on `http://localhost:5000`
2. A console launching the **Frontend Client** on `http://localhost:5173`

If you prefer launching manually from your terminal, execute:

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🛡️ Prototype Credentials

To run and test the security flows, use the following details:
- **Email:** Any valid email address (e.g., `admin@bob.com` or `test@bob.com`)
- **Login OTP:** `1234`
- **Secondary Transaction OTP:** `1234`

---

## 🔍 Core Workflows & Logic

### 1. Two-Step Authentication Grid
- Input your corporate email and click **Send Gateway OTP**.
- The login panel transitions into a **4-digit grid input**.
- The inputs feature **auto-tabulation logic** (advancing focus as you type digits, retreating focus on Backspace).
- Entering `1234` grants access to the dashboard.

### 2. Risk-Adaptive Step-Up Authentication
The platform dynamically calculates a **Session Trust Score (0-100)**. When a user requests a high-value action (e.g., "Transfer Funds"), the system evaluates the active risk context:

- **Low Risk (Normal Behavior)**
  - Access occurs from known device contexts, standard IPs, and geographical areas.
  - **Trust Score:** `98` (Neon Emerald Green accent)
  - **Action:** Clicking "Transfer Funds" completes the transfer **instantly** without requiring step-up.
- **Medium Risk (New Device Login)**
  - Access occurs from a new, unrecognized browser or device signature.
  - **Trust Score:** `65` (Electric Blue accent)
  - **Action:** Clicking "Transfer Funds" **intercepts** the action and forces a **Transaction OTP Modal** challenge.
- **High Risk (Impossible Travel Velocity)**
  - Access triggers location changes violating physical speed capability limits (e.g., login from Mumbai followed by London 5 minutes later).
  - **Trust Score:** `24` (Warning Crimson Red accent)
  - **Action:** Intercepts the action and forces a **Transaction OTP Modal** challenge. Failing the OTP increments blocked ATO alerts.

### 3. Sec-Ops Command Console
- Displays live, running indicators of blocked **Account Takeover (ATO)** attempts, **Insider Threats**, and **KYC Fraud Detections**.
- Displays an interactive **Incidents Flow Matrix** (via custom-themed Recharts) mapping hourly security anomalies.
- Serves a live, real-time scrolling log stream directly from the edge detection engine on the backend server.
