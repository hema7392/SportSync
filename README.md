# SportSync — Sports Scheduler

> **WD501 Advanced Backend Capstone Project**  
> *"Plan. Play. Connect."*

SportSync is a full-stack web application designed for sports communities, universities, and recreation clubs. It allows administrators to curate sports catalogs and analyze player engagement through configurable date-range analytics, while players can register, create match sessions with team rosters, discover upcoming games, join open player slots with conflict prevention, and manage cancellations with transparent reasoning.

---

## Live Demo & Video Demonstration

- **Live Application:** [RENDER_URL] *(Deployable to Render via one-click static + web service build)*
- **Video Demonstration:** [VIDEO_URL] *(Step-by-step walkthrough covering all grading rubric flows)*

---

## Demo Credentials

For testing and evaluation, pre-seeded accounts are provided:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@sportsync.local` | `Admin@sportsync2026` | Create sports, view admin reports & popularity metrics, create/join/cancel sessions |
| **Player (Rahul)** | `rahul@sportsync.local` | `Player@123` | Create sessions, join sessions, view created/joined sessions, cancel owned sessions |
| **Player (Anjali)** | `anjali@sportsync.local` | `Player@123` | Browse and join sessions, view cancellation reasons, update password |

*(New player accounts can also be created freely via the `/signup` page).*

---

## Features

- **Role-Based Authentication & Authorization:**
  - Secure signup, login, and token-based session handling with bcrypt password hashing.
  - Strict middleware guards (`requireAuth`, `requireAdmin`) protecting backend endpoints and React Router route boundaries.
- **Admin Sports Management:**
  - Admins can create new sports with validation and case-insensitive duplicate prevention.
  - View all active sports and monitor match participation counts.
- **Player Match Scheduling:**
  - Create sports sessions with sport selection, initial Team A and Team B player rosters, date (future-only enforced), time, venue, and required extra player slots.
- **Real-Time Slot Discovery & Visualization:**
  - Dedicated "Available Sessions" page filtering out past, full, and cancelled sessions.
  - Interactive player slot visualizer showing confirmed players with checkmarks (`✓ Rahul`) and open slots (`○ Available`).
- **Conflict Prevention Engine (Optional Feature 2):**
  - Blocks players from joining or creating overlapping sessions scheduled at the exact same date and time.
- **Strict Server-Side Past Session Restriction:**
  - Rejects attempts to join sessions whose date and time have already passed, regardless of client state.
- **Transparent Session Cancellation:**
  - Session creators can cancel matches with a mandatory non-empty cancellation reason.
  - Cancelled status and explanation are prominently displayed to all joined participants.
- **Executive Admin Analytics & Popularity Reports:**
  - Configurable date range filter (`startDate` to `endDate`).
  - Total played sessions counter (strictly completed past sessions, excluding cancellations).
  - Relative sport popularity breakdown with counts and percentages.
  - Interactive Recharts bar charts and donut charts.
- **Self-Service Password Management (Optional Feature 1):**
  - Authenticated users can update their passwords securely from Settings.

---

## User Roles

### A. Administrator
- Signs in via dedicated or standard credentials.
- Creates and manages sports in the catalog.
- Views reports on played matches and sport popularity across custom date ranges.
- Operates as a player: can also create sessions, browse matches, join matches, and cancel their own sessions.

### B. Player
- Signs up with full name, email, and password.
- Creates sports sessions with custom rosters and slot requirements.
- Browses available matches with open slots.
- Joins matches without double-booking or scheduling conflicts.
- Reviews "My Created Sessions" and "My Joined Sessions" in distinct dashboards.
- Cancels owned sessions with required explanations and inspects cancellation reasons for joined matches.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Node.js, Express.js, RESTful API architecture |
| **ORM & Database** | Prisma ORM, SQLite (local development zero-config), PostgreSQL (Render production) |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs password hashing |
| **Validation** | Express-Validator (server-side input normalization & validation) |
| **Testing** | Vitest, Supertest (30 integration tests passing) |
| **Deployment** | Render (Express serves compiled React frontend in single web service) |

---

## Screenshots

> *Capture the following application screenshots and place them in the `/screenshots/` directory:*

### 1. Home / Landing Page
![Home Page](screenshots/home.png)

### 2. Authentication (Login & Signup)
![Login Screen](screenshots/login.png)

### 3. Administrator Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)

### 4. Create & Manage Sports
![Create Sport](screenshots/create-sport.png)

### 5. Player Dashboard
![Player Dashboard](screenshots/player-dashboard.png)

### 6. Create Sport Session
![Create Session](screenshots/create-session.png)

### 7. Available Sessions
![Available Sessions](screenshots/available-sessions.png)

### 8. Session Details & Slot Visualizer
![Session Details](screenshots/session-details.png)

### 9. My Joined Sessions
![Joined Sessions](screenshots/my-joined-sessions.png)

### 10. Cancelled Session with Reason
![Cancelled Session](screenshots/cancelled-session.png)

### 11. Admin Reports & Charts
![Admin Reports](screenshots/reports.png)

---

## Local Installation

### Prerequisites
- Node.js (v18 or v20+ recommended; v22 tested)
- npm (v9+)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/sports-scheduler.git
cd sports-scheduler
```

### 2. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### 3. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```

### 4. Initialize Database & Seed Demo Data
```bash
# Generate Prisma Client and create SQLite database
npm run db:push

# Seed default administrator, demo players, sports, and sample sessions
npm run seed
```

### 5. Start Development Servers
```bash
# Runs Express API on http://localhost:5000 and Vite React on http://localhost:5173
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Running Automated Tests

Run the full Supertest + Vitest test suite:
```bash
npm run test
```
*Executes 30 test cases verifying auth, roles, sports creation, session creation, joining, past rejection, full rejection, conflict prevention, cancellation reasons, and date-filtered admin reports.*

---

## API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/signup` — Register a new player account `{ name, email, password }`
- `POST /api/auth/login` — Sign in and obtain JWT `{ email, password }`
- `POST /api/auth/logout` — Invalidate session
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `POST /api/auth/change-password` — Change password `{ currentPassword, newPassword, confirmNewPassword }`

### Sports Management (`/api/sports`)
- `GET /api/sports` — List all sports *(authenticated)*
- `GET /api/sports/created` — List sports created by current admin *(admin only)*
- `GET /api/sports/:id` — View specific sport details *(authenticated)*
- `POST /api/sports` — Create a new sport `{ name }` *(admin only)*
- `DELETE /api/sports/:id` — Remove a sport *(admin only)*

### Sessions & Matchmaking (`/api/sessions`)
- `GET /api/sessions` — Browse open, joinable upcoming sessions with vacant slots
- `POST /api/sessions` — Create a sport match session *(creator must have no time conflicts)*
- `GET /api/sessions/created` — View all sessions created by logged-in user
- `GET /api/sessions/joined` — View all sessions joined by logged-in user (shows cancellation reasons)
- `GET /api/sessions/:id` — View complete session details, team rosters, and slot breakdown
- `POST /api/sessions/:id/join` — Join session slot *(atomic transaction, checks conflicts & past dates)*
- `POST /api/sessions/:id/cancel` — Cancel session `{ reason }` *(creator only, required reason)*

### Administrator Reports (`/api/reports`)
- `GET /api/reports/sessions?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` — Generate played sessions summary & sport popularity breakdown *(admin only)*

---

## Project Structure

```text
sports-scheduler/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── api/                # Modular API service clients (auth, sports, sessions, reports)
│   │   ├── components/         # Reusable UI elements (Navbar, Footer, Modals, Cards, SlotVisualizer)
│   │   ├── context/            # AuthContext (JWT management, user state)
│   │   ├── pages/              # View components (Dashboards, Sports, Sessions, Reports, Settings)
│   │   ├── App.jsx             # React Router routing configuration with protected route guards
│   │   └── index.css           # Tailwind base styles and font declarations
│   ├── package.json
│   └── vite.config.js          # Vite config with /api proxy to Express
│
├── server/                     # Express.js Backend API
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma relational schema (User, Sport, SportSession, SessionParticipant)
│   │   └── seed.js             # Seeding script with demo admin, players, sports, and matches
│   ├── scripts/
│   │   └── switch-provider.js  # Helper to switch Prisma between SQLite (local) and PostgreSQL (Render)
│   ├── src/
│   │   ├── controllers/        # Request handlers (auth, sports, sessions, reports)
│   │   ├── middleware/         # authMiddleware, roleMiddleware, errorHandler, validate
│   │   ├── routes/             # Express API route modules
│   │   ├── services/           # Business logic (conflict checking, join eligibility validation)
│   │   ├── utils/              # Token generation and verification
│   │   ├── validators/         # Express-validator input validation schemas
│   │   ├── app.js              # Express app setup, CORS, static client serving
│   │   └── index.js            # Server listener entry point
│   ├── tests/
│   │   └── api.test.js         # Vitest + Supertest integration test suite (30 test cases)
│   ├── package.json
│   └── vitest.config.js
│
├── screenshots/                # Application screenshots for capstone documentation
├── .env.example                # Sample environment variables
├── .gitignore
├── package.json                # Root monorepo orchestration scripts
└── README.md                   # Complete capstone documentation
```

---

## Features Implemented & Requirements Audit

| Requirement | Status | Implementation Details |
| :--- | :---: | :--- |
| **Player Signup & Login** | PASS | Email format check, uniqueness, bcrypt hashing, JWT issuance |
| **Role-Based Authorization** | PASS | `requireAdmin` and `requireAuth` middleware on backend and routes |
| **Admin Sports Management** | PASS | Create sports, duplicate prevention, session counts |
| **Player Session Creation** | PASS | Sport selection, Team A/B players, venue, future date/time check |
| **Available Sessions Feed** | PASS | Excludes past, full, and cancelled sessions |
| **Session Slot Visualizer** | PASS | Confirmed players with checkmarks, unfilled slots, slot breakdown |
| **Session Joining** | PASS | Atomic transaction; validates capacity, user status, and duplicates |
| **Past Session Rejection** | PASS | Server-side enforcement rejecting `startDateTime <= now` |
| **Scheduling Conflict Engine** | PASS | Blocks double-booking at identical start timestamps |
| **Session Cancellation** | PASS | Creator-only, mandatory cancellation reason, status updated to CANCELLED |
| **Cancellation Visibility** | PASS | Joined players see CANCELLED badge and creator's cancellation reason |
| **Admin Analytics Reports** | PASS | Dynamic date range filtering, played session calculation, popularity charts |
| **Change Password** | PASS | Validates current password, hashes new password, updates database |
| **Automated Testing** | PASS | 30 Vitest/Supertest integration test cases across all modules |

---

## Deployment to Render

The application is structured for **Single-Service 1-Click Deployment** on Render: Express automatically serves the production-compiled React frontend from `client/dist` when `NODE_ENV=production`.

### Step-by-Step Render Setup:
1. **Create a PostgreSQL Database** on Render (under *New > PostgreSQL*).
2. Note the **Internal Database URL** (e.g. `postgresql://user:password@hostname/dbname`).
3. **Create a Web Service** connected to your repository.
4. Configure settings:
   - **Environment:** `Node`
   - **Build Command:**
     ```bash
     npm run render-build
     ```
   - **Start Command:**
     ```bash
     npm start
     ```
5. Set **Environment Variables** in Render dashboard:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `<Your Render PostgreSQL URL>`
   - `JWT_SECRET` = `<Generate a secure random string>`
   - `ADMIN_EMAIL` = `admin@sportsync.local`
   - `ADMIN_PASSWORD` = `<Your chosen admin password>`
   - `ADMIN_NAME` = `System Administrator`
6. Click **Deploy Web Service**. Render builds the React client, pushes Prisma schema, and launches the Express server.

---

## Future Improvements

- **Email / Webhook Notifications:** Instant email or push alerts sent to participants when a match is cancelled.
- **Skill Level Matchmaking:** Categorizing sessions by player experience (Beginner, Intermediate, Advanced).
- **In-App Match Chat:** Real-time messaging within the session details page for coordinating rides and gear.
- **Venue Geolocation:** Integration with map APIs (e.g. Google Maps or OpenStreetMap) for turn-by-turn navigation.
