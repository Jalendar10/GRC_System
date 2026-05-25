<div align="center">

# 🛡️ GRC Engineering Platform

### **Automated Governance, Risk & Compliance — Continuous, AI-Powered, Always Audit-Ready**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://typescriptlang.org)

---

![GRC System Infographic](GRC_System_Infographic.png)

---

> **The Problem:** Companies wait 12 months between audits, then scramble for weeks, pay huge fines, and fail compliance checks they could have caught on Day 1.
>
> **The Solution:** Automated quarterly audits run continuously in the background. Every control is tested, every risk is scored, every gap is surfaced — automatically. By the time the annual regulator audit arrives, you've already passed it four times.

</div>

---

## 🎯 What This POC Solves

Traditional GRC is broken:

| Old Way (Broken) | GRC Engineering Platform |
|---|---|
| 1 audit per year | **Automated audit every quarter** |
| Weeks of manual evidence collection | **Evidence collected automatically in seconds** |
| Consultants charge $500K for audit prep | **AI does it 24/7 for free** |
| Fines discovered after the fact | **Gaps caught before the regulator sees them** |
| Excel spreadsheets & email chains | **Live dashboard with real-time compliance score** |
| 6-week audit cycle | **Continuous monitoring — always ready** |

**The result:** Zero surprise audit failures. Zero last-minute scrambles. Zero compliance fines from issues you didn't know about.

---

## ✨ Key Features

### 🤖 AI-Powered Automated Audits
- Runs a full compliance audit every quarter **automatically** — no human trigger required
- AI (Claude, GPT-4, Gemini, Mistral — your choice) analyzes every control, rates effectiveness, writes findings
- Generates executive summaries, root-cause analysis, and prioritized remediation plans

### 📊 Real-Time Compliance Dashboard
- Live compliance score across all frameworks (PCI-DSS, SOX, ISO 27001, NIST-CSF, GDPR, HIPAA, DORA, Basel III, and 17 more)
- Risk heat maps, control trend charts, policy acknowledgment rates
- Multi-organization support with org-level compliance tracking

### 🔒 Control Registry (Automated Testing)
- Every control auto-tested on schedule (daily / weekly / quarterly)
- Evidence collected automatically from integrated sources
- AI scores each control: Effective / Partially Effective / Ineffective

### ⚠️ Risk Register (AI Risk Scoring)
- Inherent and residual risk scored by AI using Basel III / FFIEC taxonomy
- Financial exposure estimates (low / expected / high in USD)
- Threat-actor mapping and KRI tracking

### 📋 Audit Center
- One-click AI audit execution — full report in 60 seconds
- Findings with severity, root cause, remediation owner, and due date
- Historical audit comparison — track improvement over time

### 📜 Policy Management
- AI gap analysis: "What policies are missing for SOX compliance?"
- Policy acknowledgment tracking with percentage rates
- Automated policy expiry and review reminders

### 🏢 Vendor Risk Management
- Third-party risk scoring across all vendors
- Automated vendor assessment with AI risk analysis
- Contract value, data access, and certification tracking

### 🚨 Incident Management
- Structured incident logging with severity classification
- Regulatory notification tracking (GDPR 72-hour rule, etc.)
- AI-assisted root cause analysis and lessons learned

### 🔔 Live Notifications
- Real-time alert system (critical / warning / info)
- Notification bell with unread count, mark-read, mark-all-read
- Automatic alerts for overdue controls, compliance drops, audit deadlines

### 🔑 Authentication & RBAC
- JWT-based authentication with role-based access control
- Roles: Admin, GRC Manager, Auditor, Risk Owner, Viewer
- Protected routes — every page requires authentication

### 📡 Live Monitoring
- Continuous compliance trajectory tracking
- Gap analysis with actionable remediation steps
- Automated quarterly audit trigger on schedule

### 💾 GRC-as-Code
- Define controls in YAML/Python — version-controlled, peer-reviewed
- Infrastructure-as-Code style compliance definitions
- Git-based audit trail for all control changes

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    React Frontend (TypeScript)                   │
│  Dashboard · Controls · Risks · Audits · Policies · Vendors     │
│  Incidents · Frameworks · Monitoring · GRC-as-Code · Settings   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API (Vite proxy → /api)
┌──────────────────────────▼──────────────────────────────────────┐
│                    FastAPI Backend (Python)                      │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Auth +  │  │ Controls │  │  Risks   │  │  Audits (AI)  │  │
│  │  RBAC    │  │  Engine  │  │  Engine  │  │  Automated    │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘  │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Vendors  │  │Incidents │  │ Policies │  │  Monitoring   │  │
│  │  Risk    │  │  Mgmt    │  │ + Gaps   │  │  Continuous   │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              AI Service (Multi-Provider)                  │  │
│  │  Anthropic Claude · OpenAI GPT-4 · Google Gemini         │  │
│  │  Mistral · Cohere · Azure OpenAI                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              SQLite (dev) / PostgreSQL (prod)             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.11+ | [python.org](https://python.org) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Git | any | [git-scm.com](https://git-scm.com) |

### 1. Clone the Repository

```bash
git clone https://github.com/Jalendar10/GRC_System.git
cd GRC_System
```

### 2. One-Command Start

```bash
chmod +x start.sh
./start.sh
```

That's it. The script will:
- ✅ Create Python virtual environment
- ✅ Install all dependencies
- ✅ Seed the database with realistic banking GRC data
- ✅ Start the FastAPI backend on `http://localhost:8000`
- ✅ Install frontend dependencies
- ✅ Start the React dev server on `http://localhost:3000`

### 3. Open the Platform

Navigate to **http://localhost:3000** and sign in:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| 🔑 Admin | `admin@grc.com` | `Admin@2026` | Full access |
| 📊 Analyst | `analyst@grc.com` | `Analyst@2026` | GRC operations |
| 🔍 Auditor | `auditor@grc.com` | `Auditor@2026` | Audit & read |

---

## 🔧 Manual Setup (If `start.sh` Doesn't Work)

### Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate          # macOS/Linux
# .venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Seed the database
.venv/bin/python seed.py

# Start the API server
.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend (in a new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

> ⚠️ **Important:** Always use `.venv/bin/uvicorn` (not system `uvicorn`) to ensure the correct Python environment with all packages.

---

## 🤖 Enable AI Features

The platform works without an AI key (uses intelligent mock responses), but real AI unlocks full analysis power.

### Option 1: Environment Variable (Recommended)

```bash
# backend/.env
ANTHROPIC_API_KEY=sk-ant-...
```

### Option 2: Settings UI

1. Go to **Settings** → AI Providers
2. Choose your provider (Anthropic, OpenAI, Google, Mistral, Cohere, Azure)
3. Paste your API key and click **Test Connection**
4. Click **Save & Activate**

### Supported AI Providers

| Provider | Models | Best For |
|----------|--------|----------|
| **Anthropic** ⭐ | Claude Opus 4, Sonnet 4, Haiku | Best GRC analysis quality |
| **OpenAI** | GPT-4o, o1, GPT-4-turbo | Strong general analysis |
| **Google** | Gemini 1.5 Pro/Flash | Fast, cost-effective |
| **Mistral** | Mistral Large/Medium | European data residency |
| **Cohere** | Command R+ | Enterprise RAG use cases |
| **Azure OpenAI** | GPT-4o, GPT-4-turbo | Enterprise compliance |

---

## 📋 Compliance Frameworks Supported

| Framework | Category | Coverage |
|-----------|----------|---------|
| PCI-DSS 4.0 | Payment Security | ✅ Full |
| SOX Section 404 | Financial Reporting | ✅ Full |
| ISO 27001:2022 | Information Security | ✅ Full |
| NIST-CSF 2.0 | Cybersecurity | ✅ Full |
| FFIEC-CAT | Banking Cyber | ✅ Full |
| Basel III | Operational Risk | ✅ Full |
| GDPR | Data Privacy (EU) | ✅ Full |
| CCPA/CPRA | Data Privacy (CA) | ✅ Full |
| HIPAA | Healthcare | ✅ Full |
| SOC 2 Type II | Trust Services | ✅ Full |
| DORA | Digital Resilience (EU) | ✅ Full |
| NIS2 | Network Security (EU) | ✅ Full |
| NIST 800-53 | Federal Controls | ✅ Full |
| FedRAMP | Cloud Authorization | ✅ Full |
| AML/BSA | Anti-Money Laundering | ✅ Full |
| MiFID II | Investment Firms | ✅ Full |
| APRA CPS 234 | Australian Banking | ✅ Full |
| MAS TRM | Singapore Banking | ✅ Full |
| COBIT 2019 | IT Governance | ✅ Full |
| HITRUST CSF | Healthcare IT | ✅ Full |
| CMMC | Defense Contractors | ✅ Full |
| ISO 22301 | Business Continuity | ✅ Full |
| FISMA | Federal Information | ✅ Full |
| FINRA | Broker-Dealers | ✅ Full |
| CCAR/DFAST | Stress Testing | ✅ Full |

---

## 🗂️ Project Structure

```
grc-platform/
├── backend/
│   ├── app/
│   │   ├── api/              # REST API endpoints
│   │   │   ├── auth.py       # Authentication & user management
│   │   │   ├── controls.py   # Control registry (paginated, searchable)
│   │   │   ├── risks.py      # Risk register (paginated, AI-scored)
│   │   │   ├── audits.py     # Audit center (AI-automated)
│   │   │   ├── policies.py   # Policy management & gap analysis
│   │   │   ├── frameworks.py # Framework compliance tracking
│   │   │   ├── vendors.py    # Vendor risk management
│   │   │   ├── incidents.py  # Incident management
│   │   │   ├── monitoring.py # Continuous monitoring
│   │   │   ├── notifications.py # Real-time notifications
│   │   │   ├── activity_log.py  # Full audit trail
│   │   │   ├── export.py     # CSV export for all modules
│   │   │   └── settings.py   # AI provider configuration
│   │   ├── core/
│   │   │   ├── auth.py       # JWT + bcrypt + RBAC
│   │   │   ├── config.py     # Environment-driven config
│   │   │   └── database.py   # SQLAlchemy + SQLite/PostgreSQL
│   │   ├── models/           # SQLAlchemy ORM models
│   │   └── services/
│   │       ├── ai_service.py      # Multi-provider AI engine
│   │       └── evidence_collector.py # Auto evidence collection
│   ├── controls/frameworks/   # YAML framework definitions
│   ├── main.py               # FastAPI app + middleware
│   ├── seed.py               # Realistic banking GRC data
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.tsx      # Executive compliance overview
│       │   ├── Controls.tsx       # Control registry
│       │   ├── Risks.tsx          # Risk register
│       │   ├── Audits.tsx         # AI-powered audit center
│       │   ├── Policies.tsx       # Policy management
│       │   ├── Frameworks.tsx     # Framework compliance
│       │   ├── Vendors.tsx        # Vendor risk management
│       │   ├── Incidents.tsx      # Incident management
│       │   ├── Monitoring.tsx     # Live monitoring
│       │   ├── GRCAsCode.tsx      # GRC-as-Code editor
│       │   ├── Settings.tsx       # AI provider settings
│       │   └── Login.tsx          # Authentication
│       ├── components/
│       │   ├── Sidebar.tsx        # Navigation
│       │   ├── Header.tsx         # Notification bell + user menu
│       │   ├── ProtectedRoute.tsx # Auth guard + RBAC
│       │   └── ErrorBoundary.tsx  # Production error handling
│       ├── contexts/
│       │   ├── AuthContext.tsx    # JWT session management
│       │   ├── OrgContext.tsx     # Multi-org switching
│       │   └── ToastContext.tsx   # Global notification system
│       └── lib/
│           ├── api.ts             # Typed API client (all modules)
│           └── types.ts           # TypeScript interfaces
│
├── start.sh                  # One-command launcher
└── docker-compose.yml        # Docker deployment
```

---

## 🐳 Docker Deployment

```bash
# Build and start everything
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT Bearer tokens (HS256) |
| Password hashing | bcrypt (cost factor 12) |
| Rate limiting | 200 req/min per IP (in-process) |
| Secret key | Auto-generated `secrets.token_urlsafe(32)` |
| CORS | Configurable via `CORS_ORIGINS_STR` env var |
| Error handling | Stack traces hidden in production (`DEBUG=false`) |
| RBAC | Role-based route protection (admin/grc_manager/auditor/risk_owner/viewer) |
| Token expiry | 8-hour access tokens |

---

## ⚙️ Environment Variables

Create `backend/.env`:

```env
# App
APP_NAME=GRC Engineering Platform
DEBUG=false
ENVIRONMENT=production

# Database (SQLite for dev, PostgreSQL for prod)
DATABASE_URL=sqlite:///./grc_platform.db
# DATABASE_URL=postgresql://user:pass@localhost/grc

# Security — REQUIRED in production
SECRET_KEY=your-256-bit-secret-key-here

# CORS — comma-separated origins
CORS_ORIGINS_STR=https://yourdomain.com,https://www.yourdomain.com

# AI Provider (optional — platform works without it)
ANTHROPIC_API_KEY=sk-ant-...

# Organization
ORG_NAME=Your Company Name
ORG_TYPE=financial_services
```

---

## 📡 API Reference

The full OpenAPI docs are available at:
- **Swagger UI:** http://localhost:8000/docs *(development only)*
- **ReDoc:** http://localhost:8000/redoc *(development only)*

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Authenticate, get JWT |
| `GET` | `/api/auth/me` | Current user info |
| `GET` | `/api/controls/?page=1&limit=50&search=` | Paginated control list |
| `POST` | `/api/controls/{id}/test` | Run AI control test |
| `GET` | `/api/risks/?page=1&limit=50` | Paginated risk list |
| `POST` | `/api/risks/{id}/assess` | AI risk assessment |
| `POST` | `/api/audits/{id}/run` | Run full AI audit |
| `POST` | `/api/policies/{id}/analyze-gaps` | AI gap analysis |
| `GET` | `/api/vendors/` | Vendor risk list |
| `GET` | `/api/incidents/` | Incident list |
| `GET` | `/api/notifications/unread-count` | Notification count |
| `GET` | `/api/monitoring/status` | Live compliance status |
| `GET` | `/api/export/controls` | Export CSV |

---

## 🗺️ Roadmap

- [ ] **WebSocket** — Real-time audit progress streaming
- [ ] **Alembic migrations** — Database schema versioning
- [ ] **Celery + Redis** — Background job queue for audits
- [ ] **Evidence upload** — Attach files/screenshots to controls
- [ ] **Email alerts** — Notify owners when controls fail
- [ ] **SAML/SSO** — Enterprise identity provider integration
- [ ] **Pentest integration** — Auto-import findings from Burp/Metasploit
- [ ] **Regulator portal** — Read-only view for external auditors
- [ ] **Mobile app** — iOS/Android compliance on the go
- [ ] **Multi-tenant** — SaaS-grade tenant isolation
- [ ] **PostgreSQL** — Production-grade database migration
- [ ] **Kubernetes** — Helm chart for enterprise deployment

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 💡 The Vision

> Every company in a regulated industry — banking, healthcare, insurance, fintech, defense — faces the same GRC nightmare: annual audits are expensive, stressful, and always reveal problems that existed for 11 months before anyone noticed.
>
> This platform flips the model. Instead of **reacting** to audits, you **automate** them. Every control is continuously tested. Every risk is continuously scored. Every gap is surfaced the day it appears, not the day the auditor walks in.
>
> The result: companies are **always audit-ready**. No fines. No scrambling. No consultants charging $500/hour to collect evidence you should have had automated.

---

<div align="center">

**Built with ❤️ for GRC Engineers who believe compliance should be automated, not manual.**

⭐ Star this repo if it saves your team from an audit nightmare!

[🐛 Report Bug](https://github.com/Jalendar10/GRC_System/issues) · [💡 Request Feature](https://github.com/Jalendar10/GRC_System/issues) · [📧 Contact](mailto:vijayreddymaligireddy@gmail.com)

</div>
