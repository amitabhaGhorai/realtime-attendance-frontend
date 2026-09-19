# Real-Time Attendance Management System — Frontend Web Application

A modern, responsive, real-time web dashboard built with **React 18**, **Vite**, **Tailwind CSS**, and **Lucide Icons**. Connects seamlessly to the FastAPI backend via RESTful APIs and low-latency WebSockets.

---

## Features

- **Live Camera Attendance HUD**: WebRTC canvas preview with HUD target alignment, real-time attendance counters, and audio cues
- **Multi-Role Dashboards**:
  - **Super Admin & Admin**: Institutional KPI overview, camera fleet status, recognition rules configuration
  - **Teacher**: Class session lifecycle control (Start, Pause, Close), live attendance room, manual override modal
  - **Student**: Personalized portal with semester attendance percentage, 75% collegiate eligibility warning, and class history
  - **Camera Operator**: Dedicated edge camera viewport and device telemetry
- **Biometric Face Registration**: Guided 3-shot webcam enrollment wizard with Laplacian sharpness check and privacy revocation controls
- **Reports & Data Visualizations**: Daily turnout analytics, RFC-4180 CSV export, and ReportLab PDF downloads
- **Quick Demo Logins**: 1-click role switcher pills for instant evaluation

---

## Quick Setup & Launch

```powershell
# 1. Install dependencies
npm install

# 2. Run local development server (with Hot Module Replacement)
npm run dev
# Opens at: http://localhost:3000

# 3. Build optimized production bundle
npm run build
```

---

## Environment & Proxy Configuration

In `vite.config.js`, all `/api` requests and `/ws` WebSocket channels automatically proxy to the FastAPI backend at `http://localhost:8000`.
