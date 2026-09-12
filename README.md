# 🛡️ SentinelX — Security Information & Event Management (SIEM) & SOC Monitoring Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-black.svg?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MITRE ATT&CK](https://img.shields.io/badge/MITRE-ATT%26CK%20Mapped-red.svg)](https://attack.mitre.org/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/himanshu4750/SentinelX)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**SentinelX** is a full-stack cybersecurity monitoring and incident response platform designed to simulate the core operational workflows of a modern enterprise **Security Information and Event Management (SIEM)** and **Security Operations Center (SOC)**.

The platform ingests simulated security events in real-time, evaluates them against automated rule-based threat detection logic, calculates dynamic risk scores, maps alerts to standardized **MITRE ATT&CK** tactics and techniques, and correlates related alerts into manageable security incidents with complete audit histories and analyst investigation notes.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Detection Engine & MITRE ATT&CK Mapping](#-detection-engine--mitre-attck-mapping)
- [Incident & Alert Lifecycles](#-incident--alert-lifecycles)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [REST API Reference](#-rest-api-reference)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Database Configuration](#1-database-configuration)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Simulating Security Events](#-simulating-security-events)
- [Contributing & Roadmap](#-contributing--roadmap)
- [License](#-license)
- [Author](#-author)

---

## ⚡ Key Features

- **Security Event Ingestion**: High-throughput REST ingestion endpoint storing structured telemetry (timestamp, event type, username, source IP, raw metadata) in PostgreSQL.
- **Rule-Based Threat Detection**: Real-time correlation pipeline analyzing recent event history for suspicious patterns (brute force, privilege escalation, web anomalies).
- **Dynamic Risk Scoring**: Algorithmic scoring that calculates cumulative risk based on event severity, recurrence, and target sensitivity.
- **MITRE ATT&CK Alignment**: Automated taxonomy enrichment mapping every triggered alert to MITRE ATT&CK IDs, tactics, and techniques.
- **Automated Incident Correlation**: Intelligent grouping of alerts sharing common attributes (e.g. source IP, username) into unified, trackable incidents to eliminate alert fatigue.
- **Full Lifecycle Management**: Transitions for alerts (`NEW` &rarr; `ACKNOWLEDGED` &rarr; `CLOSED`) and incidents (`OPEN` &rarr; `INVESTIGATING` &rarr; `RESOLVED`).
- **Audit Trails & Status History**: Immutable logging of every status transition and analyst action for compliance and post-incident review.
- **Analyst Investigation Notes**: Interactive collaborative notebook allowing SOC analysts to record findings, hypothesis, and triage steps directly on incidents and alerts.
- **Interactive SOC Dashboard**: Real-time visualization suite displaying high-priority alerts, severity distributions, temporal trends, and quick-pivot filters built with React and Recharts.

---

## 🏗️ System Architecture

```text
    ┌───────────────────────────┐
    │  Simulated Security Event │ (Auth, Web, System Logs)
    └─────────────┬─────────────┘
                  │ POST /api/events
                  ▼
    ┌───────────────────────────┐
    │  Express REST Ingestion   │ (Input Sanitization & Schema Validation)
    └─────────────┬─────────────┘
                  │
                  ├───► [ PostgreSQL: events ] (Persistent Log Store)
                  │
                  ▼
    ┌───────────────────────────┐
    │  Threat Detection Engine  │ (Pattern Matching & Sliding Window Analysis)
    └─────────────┬─────────────┘
                  │
                  ▼
    ┌───────────────────────────┐
    │    Risk Scoring Engine    │ (Severity Calculation & Thresholding)
    └─────────────┬─────────────┘
                  │
                  ▼
    ┌───────────────────────────┐
    │   MITRE ATT&CK Mapper     │ (Enrichment: Tactics, Techniques & IDs)
    └─────────────┬─────────────┘
                  │
                  ▼
    ┌───────────────────────────┐
    │ Incident Correlation Hub  │ (Entity-based Alert Grouping & Deduplication)
    └─────────────┬─────────────┘
                  │
                  ├───► [ PostgreSQL: alerts, incidents, status_history ]
                  │
                  ▼
    ┌───────────────────────────┐
    │   React SOC Dashboard     │ (Live Metrics, Incident Triage & Timelines)
    └───────────────────────────┘
```

---

## 🎯 Detection Engine & MITRE ATT&CK Mapping

SentinelX evaluates ingested telemetry against detection rules aligned with the industry-standard **MITRE ATT&CK** enterprise framework:

| Detection Rule | Description | Trigger Threshold | MITRE ATT&CK | Technique ID |
|---|---|---|---|---|
| **Repeated Login Failures** | Detects brute-force credential stuffing attempts | Multiple failed logins within a rolling window | Credential Access | **T1110** (Brute Force) |
| **Successful Login After Failures** | Detects unauthorized account takeover after brute force | Successful login following repeated failed attempts | Initial Access / Persistence | **T1078** (Valid Accounts) |
| **New Source Login** | Flags authentications originating from unfamiliar IPs | First-seen IP address for an established account | Defense Evasion | **T1078** (Valid Accounts) |
| **Privilege Change** | Detects unauthorized privilege escalation or role changes | Role modification or group promotion events | Privilege Escalation | **T1098** (Account Manipulation) |
| **Suspicious Web Request** | Identifies simulated SQLi, XSS, or path traversal vectors | Anomalous query patterns or malicious payloads | Initial Access | **T1190** (Exploit Public-Facing App) |

---

## 🔄 Incident & Alert Lifecycles

### Incident Workflow
```text
  [ OPEN ] ────(Analyst Assigns & Triages)────► [ INVESTIGATING ] ────(Root Cause Resolved)────► [ RESOLVED ]
     ▲                                                                                                 │
     │                                                                                                 │
     └──────────────────────(New correlated activity after closure triggers new incident)─────────────┘
```

### Alert Workflow
```text
  [ NEW ] ────────────────► [ ACKNOWLEDGED ] ────────────────► [ CLOSED ]
```
*Every state change automatically logs an entry into `incident_status_history` and `alert_status_history` with timestamps and analyst identifiers.*

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Data Visualization**: Recharts (Severity distributions, alerts-over-time trends)
- **HTTP Client**: Axios
- **Styling**: Modern, responsive dark-themed SOC UI CSS

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (v5)
- **Database Driver**: `pg` (node-postgres connection pooling)
- **Environment Management**: `dotenv`
- **CORS**: `cors` middleware

### Database
- **Engine**: PostgreSQL
- **Design**: Normalized schema with relational integrity, foreign key cascades, and JSONB event metadata support

---

## 📂 Project Structure

```text
SentinelX/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js            # PostgreSQL connection pool configuration
│   │   │   ├── initDatabase.js        # Schema migration and table setup script
│   │   │   └── addMitreColumns.js     # MITRE schema migration helper
│   │   ├── controllers/
│   │   │   ├── alertController.js     # Alert queries, status updates, notes
│   │   │   ├── dashboardController.js # Metric aggregations & analytics
│   │   │   ├── eventController.js     # Event ingestion & retrieval
│   │   │   └── incidentController.js  # Incident triage, correlation, timelines
│   │   ├── data/                      # Store access layers
│   │   ├── detection/
│   │   │   ├── detectionEngine.js     # Core rule evaluation orchestrator
│   │   │   └── rules/                 # Authentication, privilege, web rules
│   │   ├── incidents/
│   │   │   └── incidentEngine.js      # Correlation and grouping logic
│   │   ├── risk/
│   │   │   └── riskEngine.js          # Dynamic severity and scoring logic
│   │   ├── routes/                    # Express REST route definitions
│   │   └── services/                  # Business logic services
│   ├── .env.example                   # Environment configuration template
│   ├── package.json                   # Backend dependencies & npm scripts
│   └── server.js                      # Express server entry point
│
├── frontend/
│   ├── public/                        # Static assets, icons, and favicons
│   ├── src/
│   │   ├── assets/                    # UI branding assets
│   │   ├── App.jsx                    # Primary SOC monitoring dashboard component
│   │   ├── App.css                    # SOC theme and component styles
│   │   ├── index.css                  # Global styling
│   │   └── main.jsx                   # Vite React root
│   ├── index.html                     # HTML5 template
│   ├── package.json                   # Frontend dependencies & Vite scripts
│   └── vite.config.js                 # Vite bundler configuration
│
├── .gitignore                         # Comprehensive git ignore rules
├── LICENSE                            # MIT License
└── README.md                          # Platform documentation
```

---

## 🔌 REST API Reference

### 1. Security Events (`/api/events`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/events` | Ingest a new security event and execute the detection engine |
| `GET` | `/api/events` | Retrieve ingested events with pagination and filters |

#### Example Ingestion Request:
```json
POST /api/events
Content-Type: application/json

{
  "eventType": "LOGIN_FAILED",
  "username": "alex.mercer",
  "sourceIp": "198.51.100.42",
  "source": "linux-auth-daemon",
  "metadata": {
    "attempt": 1,
    "targetPort": 22
  }
}
```

### 2. Alerts (`/api/alerts`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/alerts` | List all security alerts with severity, risk score, and MITRE details |
| `PATCH` | `/api/alerts/:id/status` | Update alert status (`NEW`, `ACKNOWLEDGED`, `CLOSED`) |
| `GET` | `/api/alerts/:id/history` | Fetch status transition history for an alert |
| `GET` | `/api/alerts/:id/notes` | Get analyst notes attached to an alert |
| `POST` | `/api/alerts/:id/notes` | Add an investigation note to an alert |

### 3. Incidents (`/api/incidents`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/incidents` | List correlated incidents |
| `GET` | `/api/incidents/:incidentId` | Get detailed incident report including linked alerts and event timelines |
| `PATCH` | `/api/incidents/:incidentId/status` | Transition incident lifecycle (`OPEN`, `INVESTIGATING`, `RESOLVED`) |
| `GET` | `/api/incidents/:incidentId/history` | Fetch audit status transition log |
| `GET` | `/api/incidents/:incidentId/notes` | View investigation notes for an incident |
| `POST` | `/api/incidents/:incidentId/notes` | Append analyst notes to an incident |

### 4. Dashboard Metrics (`/api/dashboard`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Aggregated SOC metrics: total events, active alerts, open incidents, and severity breakdown |

---

## 🗄️ Database Schema

```sql
-- Security Events Log
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    username VARCHAR(100),
    source_ip VARCHAR(100),
    source VARCHAR(100),
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Triggered Security Alerts
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(150) NOT NULL,
    title VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    source_ip VARCHAR(100),
    severity VARCHAR(20) NOT NULL,
    risk_score INTEGER,
    mitre_tactic VARCHAR(100),
    mitre_technique VARCHAR(150),
    mitre_technique_id VARCHAR(30),
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Correlated Security Incidents
CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    incident_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    source_ip VARCHAR(100),
    severity VARCHAR(20) NOT NULL,
    risk_score INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-Many Relationship: Incidents & Alerts
CREATE TABLE incident_alerts (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    alert_id INTEGER NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    UNIQUE (incident_id, alert_id)
);
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14.x or higher)
- [Git](https://git-scm.com/)

---

### 1. Database Configuration

1. Ensure your PostgreSQL service is running.
2. Create a database for the project:
   ```sql
   CREATE DATABASE sentinelx;
   ```

---

### 2. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create your local environment configuration file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your PostgreSQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=sentinelx
   PORT=5000
   ```

5. Initialize the database tables:
   ```bash
   npm run init-db
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```
   *The backend API will be running on `http://localhost:5000`.*

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The SOC dashboard will launch at `http://localhost:5173`.*

---

## 🧪 Simulating Security Events

You can test the detection and correlation pipeline by sending simulated security events via `curl` or PowerShell:

### 1. Brute-Force Authentication Attack (Triggers `T1110` Alert)
```bash
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/events \
    -H "Content-Type: application/json" \
    -d '{
      "eventType": "LOGIN_FAILED",
      "username": "admin",
      "sourceIp": "203.0.113.15",
      "source": "ssh-guard"
    }'
done
```

### 2. Account Takeover / Valid Account Login (Triggers `T1078` Alert)
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "LOGIN_SUCCESS",
    "username": "admin",
    "sourceIp": "203.0.113.15",
    "source": "ssh-guard"
  }'
```

### 3. Unauthorized Privilege Escalation (Triggers `T1098` Alert)
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "ROLE_MODIFIED",
    "username": "admin",
    "sourceIp": "203.0.113.15",
    "source": "iam-manager",
    "metadata": { "newRole": "SuperAdmin" }
  }'
```

Observe how SentinelX automatically aggregates these events, escalates the risk score, flags the MITRE techniques, and groups them under a single correlated incident in the dashboard!

---

## 🔮 Contributing & Roadmap

Future development milestones for the SentinelX platform:
- [ ] Automated email and webhook notifications (Slack / Discord / PagerDuty)
- [ ] Machine learning anomaly detection for baseline network traffic
- [ ] User and Role-Based Access Control (RBAC) for analysts and SOC leads
- [ ] STIX / TAXII threat intelligence feed integration
- [ ] Full Docker Compose multi-container deployment
- [ ] Exportable PDF incident post-mortem reports

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Himanshu Kumar**
- GitHub: [@himanshu4750](https://github.com/himanshu4750)
- Passionate about **Cybersecurity, Security Engineering, and Full-Stack Systems**.
