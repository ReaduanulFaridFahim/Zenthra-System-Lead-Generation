# ⚡ Zenthra System Lead Generation
### Autonomous B2B Prospecting, Lead Intelligence, SDR Approval Gate & 1-Click Outreach Engine

<div align="center">

[![GitHub Pages Deployment](https://img.shields.io/badge/Deployment-GitHub%20Pages%20Live-0284c7?style=for-the-badge&logo=github)](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/)
[![Live Operations Console](https://img.shields.io/badge/Console-Live%20Operations%20Hub-059669?style=for-the-badge&logo=googlechrome)](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/console.html)
[![Cluster SLA](https://img.shields.io/badge/Cluster%20SLA-99.98%25%20Uptime-10b981?style=for-the-badge&logo=statuspage)](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/)
[![Node Version](https://img.shields.io/badge/Node.js-v24.20.0-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Powered by n8n](https://img.shields.io/badge/Orchestration-n8n%20Workflow%20Engine-EA4B71?style=for-the-badge&logo=n8n)](https://github.com/n8n-io/n8n)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br>

**[🌐 Live Enterprise Portal](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/)** • **[⚡ Live Operations Console](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/console.html)** • **[🎨 B2B Social Studio](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/poster_studio.html)** • **[🎓 Operational Training](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/practice_video.html)**

</div>

---

## 🎯 Executive Overview

**Zenthra System Lead Generation** is a full-stack, enterprise-grade client acquisition engine. It automates high-intent lead scraping from Google Maps and DuckDuckGo, validates corporate websites and RFC-5322 emails, matches prospects to calibrated enterprise services, stages cold outreach in a Human-in-the-Loop SDR Approval Gate, and dispatches value-anchored proposals via live Gmail SMTP and n8n webhooks.

---

## 🚀 Core Systems & Features

| Feature | Description | Live Access |
|---|---|---|
| **📬 "Who Can I Email?" Directory** | Roster of 300+ email-ready enterprise decision-makers across US, UK, EU, UAE, & BD with verified emails, 1-click mail delivery, and full clear options (`🧹 Clear Filters`, `🧹 Clear Selection`, `🗑️ Clear Selected from List`, `🧹 Clear Row`, `🔄 Reset Sent Flags`). | [`console.html#emailable-tab`](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/console.html) |
| **🛡️ Human-in-the-Loop SDR Approval Gate** | Complete approval queue with `🧹 Clear Queue (Reject All)`, `🗑️ Purge Backlog`, `🚀 Approve All`, recipient corporate email badges (`d.corporate_email`), and 1-click Gmail SMTP dispatch. | [`console.html#sdr-tab`](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/console.html) |
| **🗺️ Google Maps Lead Discovery & Scraper** | Live DuckDuckGo & corporate website scraper extracting 100% verified real websites and RFC-5322 email addresses (no synthetic URLs) with a 1-click `🧹 Clear All` button. | [`console.html#maps-tab`](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/console.html) |
| **💼 12 Extended Enterprise Service Offers** | Complete catalog spanning Enterprise RAG, Autonomous AI Agents, Power BI, AI Voice Receptionist, WhatsApp CRM, and Cloud DevOps. | [`console.html#services-tab`](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/console.html) |
| **⚡ Model 1: Rapid 7-Day Value Sprint** | Calibrated fixed-fee implementation sprint ($5,000–$12,500 USD) delivering 20x+ ROI with 1-click Statement of Work (SOW) generation. | [`console.html#model1-tab`](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/console.html) |
| **📊 Power BI Star Schema & DAX Engine** | Built-in analytics generating dimensional modeling (`dim_accounts`, `dim_services`, `fact_pipeline`, `fact_activities`) with DAX measures. | [`console.html#analytics-tab`](https://readuanulfaridfahim.github.io/Zenthra-System-Lead-Generation/console.html) |

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
Fill in your Gmail address and Google App Password (`SMTP_PASS`).

### 4. Seed Database & Start Server
```bash
npm run seed
npm start
```
The Zenthra Console will open live at **`http://localhost:3050`**.

---

## 🏗️ 10-Agent Autonomous Hierarchy

1. **Lead Discovery Agent (Agent 2)**: Identifies local business opportunities via Google Maps and DuckDuckGo live scraping.
2. **Company Research Agent (Agent 3)**: Harvests official domains, verified executives, and tech stack telemetry.
3. **Weakness Diagnosis Agent (Agent 4)**: Audits missing booking flows, website gaps, and operational bottlenecks.
4. **Service Matching Agent (Agent 5)**: Aligns company weaknesses with our 12 high-margin enterprise services.
5. **Outreach Drafter Agent (Agent 6)**: Generates personalized, value-anchored touchpoints across Email and LinkedIn.
6. **Proposal Architect Agent (Agent 7)**: Calculates multi-currency ROI quotes ($5,000–$12,500) and drafts SOW agreements.
7. **SDR Approval Gate (Agent 8)**: Human-in-the-loop review interface with 1-click Gmail SMTP delivery and bulk queue clearing.
8. **Pipeline Deal Tracker (Agent 9)**: Manages SQLite CRM pipeline stages from Lead to Closed Won.
9. **Inbound Reply Classifier (Agent 10)**: Classifies prospect responses into Interested, Objection, or Unsubscribe.
10. **Operations Orchestrator (Agent 1)**: Coordinates the asynchronous execution of all agents via n8n webhooks.

---

## 🔒 Security & Data Sovereignty

* **Zero Cloud Data Leakage**: All CRM records and drafts are stored locally in SQLite (`node:sqlite`).
* **Safe `.gitignore`**: `.env` and `.db` files are strictly excluded from git tracking.
* **RFC-5322 Email Validation**: Strict regex and DNS-level email verification before any SMTP socket connection.

---

## 👤 Author & Maintainer

**Readuanul Farid Fahim**
* GitHub: [@ReaduanulFaridFahim](https://github.com/ReaduanulFaridFahim)
* Portfolio: [readuanulfaridfahim.github.io](https://readuanulfaridfahim.github.io/)
