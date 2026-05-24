# <span style="color:#E11D48">InterviewAI</span>

**✨ Your AI career command-center** — build your profile, prep for interviews, track applications, and generate job-search documents.

---

<div align="center">

### <span style="font-size:18px">Quick Links</span>

- **1. Start locally** → [Setup](#-setup)
- **2. App overview** → [What it does](#-what-it-does)
- **3. Architecture** → [Backend + Frontend](#-architecture)
- **4. Directories** → [Where things live](#-where-things-live)

</div>

---

## 🚀 What it does

### 🧩 1) Profile Builder
Keep your profile complete so every AI output is personalized.

- Skills (technical + soft)
- Education
- Experience
- Certifications

### 🎤 2) Interview Preparation & Practice
Practice interviews with AI-generated questions and structured guidance.

- Generate questions from job context
- Submit answers (text/audio workflows supported in UI)
- Track progress over time

### 📌 3) Job Applications Tracker
Stay organized across the entire job-search funnel.

- Save → Apply → Interviewing → Offer → Rejected
- Add notes and next steps

### 📝 4) AI Document Generation
Generate professional materials quickly.

- CV / Resume
- Cover letters
- Follow-up emails
- LinkedIn content

### 🔗 5) LinkedIn & Research Utilities
Tools to support outreach and smarter preparation.

- LinkedIn post generation/flows
- Research & curated questions support

---

## ⚙️ Setup

This project is split into two parts:
- **Backend/** (Laravel API)
- **Frontend/** (React UI)

### ✅ Prerequisites
- **PHP** + **Composer**
- **Node.js**
- A database (configure via **Backend/.env**)
- Optional: **Bun** (frontend can use Bun or npm)

---

## ▶️ Start the app locally

### 1) Backend (Laravel)
```bash
cd Backend
composer install
cp .env.example .env   # if .env.example exists in your setup
php artisan migrate
php artisan serve
```

Your backend exposes API endpoints consumed by the React frontend.

### 2) Frontend (React + Vite)
```bash
cd Frontend
npm i
npm run dev
```

Open the URL printed by Vite in your browser.

> If the frontend can’t reach the backend: check **CORS** and the **API base URL**.

---

## 🧠 Architecture

### 🔌 How the parts connect
- **Frontend** pages under: `Frontend/src/pages/`
- call API endpoints provided by: `Backend/routes/` (especially `Backend/routes/api.php`)
- **Backend** implements core logic via services under: `Backend/app/Services/`

### 💡 Backend services (examples)
The `Backend/app/Services/` layer includes functionality for:
- authentication / user context
- profile CRUD support
- interview + questions generation
- dashboard aggregation
- chatbot / AI integrations
- LinkedIn integrations
- research helpers

---

## 📁 Where things live

### Backend/
- `routes/` → API + web routes
- `app/Http/` → controllers + requests
- `app/Models/` → Eloquent models
- `app/Services/` → business logic
- `database/migrations/` → schema migrations

### Frontend/
- `src/pages/` → main screens (Dashboard, Profile, Interviews, etc.)
- `src/components/` → reusable UI components
- `src/services/` → client API calls
- `src/hooks/` → custom hooks
- `src/lib/` → utilities

---

## 🔐 Security notes
- Keep secrets in **Backend/.env** (do not commit keys)
- If using JWT/auth, confirm keys/config match between frontend and backend
- Ensure CORS/JWT settings are correct in `Backend/config/`

---

## 📚 Repo docs
- `Backend/README.md`
- `Backend/website_guide.md`

---

## ✅ Quick checklist (new machine)
- Copy/configure **Backend/.env**
- `cd Backend && composer install`
- `php artisan migrate`
- `cd Frontend && npm i`
- Start **Backend** + **Frontend**

