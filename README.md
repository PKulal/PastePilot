<!-- ══════════════════════════════ HEADER ══════════════════════════════ -->
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:4b8eff,100:4edea3&height=200&section=header&text=PasteBin%20Pro&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Secure%20Snippets%20%C2%B7%20Redis-Fast%20Performance&descAlignY=55&descSize=18" width="100%" alt="PasteBin Pro"/>

<a href="https://github.com/PKulal/PastePilot">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=4B8EFF&center=true&vCenter=true&width=650&lines=Create.+Share.+Expire.+Repeat.;A+modern%2C+Redis-powered+Pastebin+for+developers;JWT+Auth+%C2%B7+Burn-after-reading+%C2%B7+QR+%C2%B7+Trending;Built+with+React%2C+Express%2C+Prisma+%26+Redis" alt="Typing SVG" />
</a>

<br/>

<!-- Tech badges -->
<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node"/>
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="Postgres"/>
  <img src="https://img.shields.io/badge/Redis-Core-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
</p>

<p>
  <img src="https://img.shields.io/badge/status-active-success?style=flat-square" alt="status"/>
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="license"/>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs"/>
  <img src="https://img.shields.io/badge/made%20with-%E2%9D%A4-red?style=flat-square" alt="love"/>
</p>

</div>

<!-- ══════════════════════════════ ABOUT ══════════════════════════════ -->

## ✨ What is PasteBin Pro?

**PasteBin Pro** is a modern, production-minded web application for securely creating, managing, organizing, and sharing text or code snippets. Unlike a plain Pastebin clone, it leans hard on **Redis** for temporary storage, automatic expiration, rate limiting, view analytics, trending, sessions, and caching — giving it sub-millisecond hot paths and a genuinely real-world architecture.

> 🎯 Built for **developers, students, QA & DevOps engineers, interview candidates, and teams** who need to share code fast — publicly, privately, or with self-destructing secrecy.

<div align="center">
  <img src="https://raw.githubusercontent.com/PKulal/PastePilot/main/docs/hero.png" width="90%" alt="PasteBin Pro landing" onerror="this.style.display='none'"/>
</div>

---

## 📑 Table of Contents

- [Features](#-features)
- [Redis in Action](#-redis-in-action)
- [Tech Stack](#-tech-stack)
- [Screens](#-screens)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🚀 Features

<table>
<tr>
<td width="50%" valign="top">

### 🔐 Authentication
- Register / Login / Logout
- **JWT** auth with **Redis-backed sessions**
- **Logout from all devices**
- Forgot & Reset password
- Refresh token + **Remember Me**
- Strong-password & email validation

### 👤 Profile & Settings
- Editable name, avatar, bio
- Change password
- Default visibility / expiration
- Light / Dark theme preference

### 📊 Dashboard
- Total · Public · Private · Drafts
- Archived · Expired · Burned counts
- Total views + **Most Viewed** paste
- **Recent Activity** timeline
- Redis-cached for instant loads

</td>
<td width="50%" valign="top">

### 📝 Pastes
- Rich **Monaco** code editor
- Public / Unlisted / Private visibility
- 🔒 **Password protection** (bcrypt)
- ⏳ Expiration (10m → 30d) via **Redis TTL**
- 🔥 **Burn-after-reading** (1 / 5 / 10 views)
- Tags, categories, description
- **Draft**, Publish & Live Preview

### 🗂️ Organize & Discover
- **My Pastes** — tabs, filters, sort
- ⭐ Favorites · 🗄️ Archive & Restore
- 🔎 Search by title/content/lang/tag/author
- 📈 **Trending** (Redis Sorted Set)
- ⬇️ Download as **TXT / MD / JSON**
- 📱 **QR code** generation · 🚩 Reporting

### 🛡️ Admin Panel
- Stats · User & role management
- Paste moderation · Reports queue
- System announcements

</td>
</tr>
</table>

---

## ⚡ Redis in Action

Redis isn't a bolt-on cache here — it's a **core dependency** powering seven distinct features:

| # | Feature | How it works |
|---|---------|--------------|
| 1 | **Expiring Pastes** | `SETEX` TTL mirrors the DB `expiresAt` — temporary pastes vanish automatically |
| 2 | **View Counter** | Every view `INCR`s a Redis counter, flushed to Postgres by a **30s background job** |
| 3 | **Trending** | A **Sorted Set** (`ZINCRBY`) ranks pastes by live views |
| 4 | **Rate Limiting** | Per-IP sliding window guards auth, create, search & report APIs |
| 5 | **Sessions** | Active JWTs tracked per user → enables **logout-from-all-devices** |
| 6 | **Caching** | Dashboard stats, recent & trending lists cached with short TTLs |
| 7 | **Anonymous Expiry** | Guest/temporary pastes auto-expire via Redis TTL |

---

## 🧰 Tech Stack

<div align="center">

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19 · Vite 8 · Tailwind CSS 4 · React Router 7 · Monaco Editor · Framer Motion · Lucide Icons · React Hot Toast |
| **Backend** | Node.js · Express 5 · Prisma 7 · JWT · bcrypt · Helmet · CORS · Morgan |
| **Data** | PostgreSQL 15 · Redis |
| **Tooling** | Docker Compose · QRCode · dotenv |

</div>

---

## 🖼️ Screens

<div align="center">
<table>
<tr>
<td align="center"><b>Landing</b></td>
<td align="center"><b>Dashboard</b></td>
</tr>
<tr>
<td><img src="https://raw.githubusercontent.com/PKulal/PastePilot/main/docs/landing.png" width="420" alt="Landing" onerror="this.style.display='none'"/></td>
<td><img src="https://raw.githubusercontent.com/PKulal/PastePilot/main/docs/dashboard.png" width="420" alt="Dashboard" onerror="this.style.display='none'"/></td>
</tr>
<tr>
<td align="center"><b>Create Paste</b></td>
<td align="center"><b>Paste Details</b></td>
</tr>
<tr>
<td><img src="https://raw.githubusercontent.com/PKulal/PastePilot/main/docs/create.png" width="420" alt="Create" onerror="this.style.display='none'"/></td>
<td><img src="https://raw.githubusercontent.com/PKulal/PastePilot/main/docs/view.png" width="420" alt="View" onerror="this.style.display='none'"/></td>
</tr>
</table>

> 💡 Drop screenshots into a `docs/` folder to light up this gallery.

</div>

---

## 🛠️ Local Setup

> **Prerequisites:** [Node.js](https://nodejs.org) 18+, [Docker Desktop](https://www.docker.com/products/docker-desktop/), and Git.

### 1️⃣ Clone the repo

```bash
git clone https://github.com/PKulal/PastePilot.git
cd PastePilot
```

### 2️⃣ Start Postgres + Redis (Docker)

```bash
docker compose up -d
```

> 🐳 Spins up PostgreSQL on port **15432** and Redis on port **6380**.

### 3️⃣ Set up & run the backend

```bash
cd server
npm install
npx prisma generate       # generate the Prisma client
npx prisma db push        # create the database schema
npm start                 # API → http://localhost:5000
```

<sub>Prefer auto-reload? `npm install -D nodemon` then `npm run dev`.</sub>

### 4️⃣ Run the frontend

```bash
cd ../client
npm install
npm run dev               # App → http://localhost:5173
```

### 5️⃣ (Optional) Create an admin

Register a user, then flip their role in the database:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
```

An **Admin Panel** link then appears in the sidebar. 🎉

---

## 🔑 Environment Variables

Create `server/.env` (already gitignored):

```env
PORT=5000
DATABASE_URL="postgresql://pastebin_user:pastebin_password@localhost:15432/pastebin_pro?schema=public"
REDIS_URL="redis://localhost:6380"
JWT_SECRET="change_me_in_production"
FRONTEND_URL="http://localhost:5173"
```

---

## 📡 API Reference

<details>
<summary><b>🔐 Auth</b> — <code>/api/auth</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Login (+ remember me) |
| POST | `/logout` | Logout current device |
| POST | `/logout-all` | Logout everywhere |
| POST | `/refresh` | Rotate token |
| POST | `/forgot-password` | Request reset token |
| POST | `/reset-password` | Set new password |
| GET | `/me` | Current user |

</details>

<details>
<summary><b>📝 Pastes</b> — <code>/api/pastes</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create paste (guest or user) |
| GET | `/:id` | View paste |
| POST | `/:id/unlock` | Unlock password-protected paste |
| PUT | `/:id` | Update (owner) |
| DELETE | `/:id` | Delete (owner) |
| POST | `/:id/archive` · `/:id/restore` | Archive / restore |
| POST | `/:id/duplicate` | Duplicate |
| POST · GET | `/:id/favorite` | Toggle / check favorite |
| GET | `/:id/download?format=txt\|md\|json` | Download |
| GET | `/:id/qr` | QR code (data URL) |
| GET | `/recent` · `/trending` · `/search` | Discovery |
| GET | `/mine` · `/favorites` · `/dashboard` | Personal (auth) |

</details>

<details>
<summary><b>👤 Users · 🚩 Reports · 🛡️ Admin</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/users/profile` · `/settings` · `/password` | Update profile / prefs / password |
| POST | `/api/reports` | Report a paste |
| GET | `/api/admin/stats` · `/users` · `/pastes` · `/reports` | Admin data |
| PUT/DELETE | `/api/admin/users/:id` · `/pastes/:id` · `/reports/:id` | Moderation |
| CRUD | `/api/admin/announcements` | Announcements |
| GET | `/api/announcements` | Public active announcements |

</details>

---

## 📂 Project Structure

```
PastePilot/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── api/            # Axios API layer
│       ├── components/     # Card, Button, PasteCard, PasteEditor…
│       ├── contexts/       # AuthContext
│       ├── layouts/        # DashboardLayout (sidebar)
│       ├── pages/          # Landing, Dashboard, Create, View, Admin…
│       └── routes/         # ProtectedRoute
├── server/                 # Express + Prisma backend
│   ├── config/             # DB + Redis clients
│   ├── controllers/        # auth, paste, user, favorite, report, admin
│   ├── middleware/         # auth guards, rate limiter
│   ├── services/           # redisService (sessions, trending, cache)
│   ├── jobs/               # view-count flush job
│   ├── utils/              # validators, activity logger
│   ├── prisma/             # schema.prisma
│   └── server.js
├── docker-compose.yml      # Postgres + Redis
└── README.md
```

---

## 🗺️ Roadmap

- [ ] Email delivery for password resets
- [ ] OAuth (Google / GitHub)
- [ ] Team workspaces & collections
- [ ] Comments & version history
- [ ] Public REST API keys + webhooks

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome! Feel free to open a PR or an issue.

## 📄 License

Released under the **MIT License** — free to use, modify, and share.

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:4edea3,100:4b8eff&height=120&section=footer" width="100%" alt="footer"/>

<sub>Built with ❤️ and a lot of Redis <code>INCR</code>s.</sub>

</div>
