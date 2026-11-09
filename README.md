# ⚡ Zenthra System Lead Generation
### Autonomous B2B Prospecting, Lead Intelligence, SDR Approval Gate & 1-Click Outreach Engine

<div align="center">

[![GitHub Pages Deployment](https://img.shields.io/badge/Deployment-GitHub%20Pages%20Live-0284c7?style=for-the-badge&logo=github)](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/)
[![Live Operations Console](https://img.shields.io/badge/Console-Live%20Operations%20Hub-059669?style=for-the-badge&logo=googlechrome)](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/)
[![Agency Overview](https://img.shields.io/badge/Agency-Marketing%20%26%20Services-6366f1?style=for-the-badge&logo=safari)](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/portal.html)
[![Cluster SLA](https://img.shields.io/badge/Cluster%20SLA-99.98%25%20Uptime-10b981?style=for-the-badge&logo=statuspage)](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/)
[![Node Version](https://img.shields.io/badge/Node.js-v24.20.0-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Powered by n8n](https://img.shields.io/badge/Orchestration-n8n%20Workflow%20Engine-EA4B71?style=for-the-badge&logo=n8n)](https://github.com/n8n-io/n8n)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br>

**[⚡ Live Operations & SDR Console (Main Portal)](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/)** • **[🏢 Agency Portfolio & Specs](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/portal.html)** • **[🎨 B2B Social Studio](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/poster_studio.html)** • **[🎓 Operational Training](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/practice_video.html)**

</div>

---

## 🎯 Executive Overview

**Zenthra System Lead Generation** is a full-stack, enterprise-grade client acquisition and AI operations platform. The **Live Operations & SDR Console** serves as the **primary enterprise command center** (`index.html`), providing real-time prospecting intelligence, high-intent lead scraping from Google Maps and DuckDuckGo, automated verification of corporate websites and RFC-5322 emails, Human-in-the-Loop SDR proposal staging, and 1-click multi-channel outreach.

---

## 🚀 Core Systems & Features

| Feature | Description | Direct Access |
|---|---|---|
| **⚡ Live Operations & SDR Console** | The primary enterprise command center with Executive KPIs ($14M+ pipeline, win rates, ACV), live prospect tables, SDR draft approvals, and pipeline CRM. | **[Launch Portal](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/)** |
| **📬 "Who Can I Email?" Directory** | High-precision roster of verified enterprise decision-makers across US, UK, EU, UAE, & BD with verified executive emails, 1-click mail delivery, and complete clear controls (`🧹 Clear Filters`, `🧹 Clear Selection`, `🗑️ Clear Selected from List`, `🧹 Clear Row`, `🔄 Reset Sent Flags`). | **[Email Directory](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/#emailable-tab)** |
| **🛡️ Human-in-the-Loop SDR Approval Gate** | Comprehensive review queue with `🧹 Clear Queue (Reject All)`, `🗑️ Purge Backlog`, `🚀 Approve All`, recipient corporate email badges (`d.corporate_email`), and 1-click Gmail SMTP dispatch. | **[SDR Gate](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/#sdr-tab)** |
| **🗺️ Google Maps Lead Discovery & Scraper** | Live DuckDuckGo & corporate website scraper extracting 100% verified real websites and RFC-5322 email addresses (no synthetic URLs) with 1-click `🧹 Clear All` controls and Excel-compatible CSV export. | **[Maps Scraper](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/#maps-tab)** |
| **💼 12 Extended Enterprise Service Offers** | Complete catalog spanning Enterprise RAG, Autonomous AI Agents, Power BI, AI Voice Receptionist, WhatsApp CRM, and Cloud DevOps. | **[Service Catalog](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/#services-tab)** |
| **⚡ Model 1: Rapid 7-Day Value Sprint** | Calibrated fixed-fee implementation sprint ($5,000–$12,500 USD) delivering 20x+ ROI with 1-click Statement of Work (SOW) generation. | **[Sprint Engine](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/#pricing-tab)** |
| **📊 Power BI Star Schema & DAX Engine** | Built-in analytics generating dimensional modeling (`dim_accounts`, `dim_services`, `fact_pipeline`, `fact_activities`) with DAX measures. | **[Power BI Star](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/#analytics-tab)** |
| **🏢 Agency Portfolio & Presentation** | Full marketing presentation with interactive feature walkthroughs, Cal.com scheduling modal, and live client demo projects. | **[Agency Overview](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/portal.html)** |

---

## ⚙️ Quick Start (Local Setup)

### 1. Prerequisites
* Node.js v18+ (tested on v24.20)
* Optional: n8n workflow server (`npm install -g n8n`)

### 2. Installation
```bash
git clone https://github.com/ReaduanulFaridFahim/Zenthra-System-Lead-Generation.git
cd Zenthra-System-Lead-Generation
npm install
```

### 3. Configure Credentials
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Gmail address and Google App Password (`SMTP_PASS`) if you want live SMTP outbound dispatch.

### 4. Start Server
Run the one-click batch launcher:
```bash
start-zenthra.bat
```
Or start via Node directly:
```bash
node ui/server.js
```
The console will be accessible at `http://localhost:3050`.

---

## 🌐 Cloud Live Standalone Architecture
The live deployment at `https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/` includes self-contained static JSON datasets (`data/platform-data.json`, `data/emailable-contacts.json`, `data/meta-geo.json`) with client-side reactive state management. All interactive features — including multi-criteria filtering, 1-click email staging, batch clearing, proposal review, and pricing calculators — execute smoothly in modern web browsers without requiring backend dependencies.

---

## 📄 License
MIT License. © 2026 Zenthra Systems. All rights reserved.
