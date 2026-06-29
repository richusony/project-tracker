# Project Tracker

A full-stack personal project management tool built to track everything that matters while you're building — time spent, config files, environment variables, client notes, and payment status.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript) ![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat&logo=tailwindcss) ![License](https://img.shields.io/badge/license-MIT-green?style=flat)

---

## Features

### Project Dashboard
- Create projects with a name and optional description
- Responsive card grid — 1 col on mobile, 2 on tablet, 3 on desktop
- **Status labels** on every card: Planning, Ongoing, On Hold, Completed, No Longer Needed — colour-coded badges
- Live timer pulse badge on any project with a running timer
- Inline delete with a confirmation dialog

### Project Status Labels
- Five statuses: **Planning** (blue), **Ongoing** (green), **On Hold** (amber), **Completed** (violet), **No Longer Needed** (slate)
- Change status from the project detail page via a dropdown picker
- Status persists in the database

### Time Tracker
- **Start / Pause / Resume / Stop** controls
- Live days · hours · minutes · seconds display
- Timer persists across page refreshes and browser sessions — stored in the database

### Config File Storage
- Paste the full content of any config file (`.env`, `firebase.json`, `nginx.conf`, etc.) with its file path
- Files stored securely in your database, not on disk
- Copy-to-clipboard button on each file header
- Collapsible file viewer with monospace content display
- Delete individual files at any time

### Environment Variables
- Add key/value pairs directly without needing a file
- **Paste `.env` import** mode — paste a whole `.env` file and all pairs are parsed and added in one shot
- Values masked by default with a show/hide toggle
- Copy value to clipboard with one click
- Scope tagging: Client, Server, or All — colour-coded badges
- Delete individual variables at any time

### Notes (Rich Text Editor)
- Full **TipTap**-powered editor with a toolbar supporting:
  - Bold, Italic
  - Headings (H1, H2, H3)
  - Bullet and ordered lists
  - Blockquotes and inline code
  - Clickable hyperlinks
  - **Embedded YouTube video previews** (paste a YouTube URL and it renders inline)
- Each note stores **created** and **updated** timestamps
- Notes are scoped per project
- Inline title editing on the project detail page

### Pricing & Payment Tracking
- Choose between **Fixed Price** or **Hourly Rate** billing
- **Fixed Price** supports advance and final payment blocks, each with "Mark as Received" and a calendar date picker
- **Hourly Rate** supports individual payment entries with descriptions, each markable as received
- **8 currencies:** USD, EUR, GBP, AED, SGD, AUD, CAD, INR
- **Live INR conversion** — any non-INR amount shows the equivalent in Indian Rupees using a real-time exchange rate

### Archives
- Archive any project instead of permanently deleting it (soft delete)
- Dedicated **Archives page** lists all archived projects with name, description, and archived date
- **Restore** any archived project back to the active dashboard with one click

### Dark / Light / System Theme
- Toggle between **Light**, **Dark**, and **System** (follows OS preference) from the header
- Preference saved in `localStorage` — persists across sessions
- No flash of unstyled content on load — theme class is applied before React hydrates

### Custom Dialogs
- All confirmation and prompt dialogs use a custom React component system — no native browser popups
- Danger variant (red) for destructive actions like delete
- Warning variant (amber) for recoverable actions like archive
- Keyboard accessible: Escape cancels, Enter confirms

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v3, CSS custom property design tokens |
| Fonts | Inter (UI), JetBrains Mono (code) via Google Fonts |
| Icons | Lucide React |
| Rich Text | TipTap (with YouTube + Link extensions) |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Date Handling | date-fns |
| Date Picker | react-datepicker |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas (Mongoose ODM) |
| Dev Tools | ts-node-dev, concurrently |

---

## Project Structure

```
project-tracker/
├── client/                        # React frontend
│   ├── public/
│   │   └── favicon.svg            # SVG favicon
│   └── src/
│       ├── api/index.ts           # All API calls (Axios)
│       ├── types/index.ts         # Shared TypeScript interfaces
│       ├── index.css              # Design tokens + component classes
│       ├── components/
│       │   ├── Layout.tsx         # App shell with header + nav
│       │   ├── ThemeProvider.tsx  # Dark/light/system theme context + toggle
│       │   ├── DialogProvider.tsx # Custom confirm/prompt dialog context
│       │   ├── StatusBadge.tsx    # StatusBadge + StatusPicker components
│       │   ├── AddProjectModal.tsx
│       │   ├── Timer.tsx          # Live timer with controls
│       │   ├── ConfigFiles.tsx    # File upload + viewer + copy
│       │   ├── EnvVariables.tsx   # Key/value env manager + .env paste import
│       │   ├── Pricing.tsx        # Payment tracking + INR conversion
│       │   └── RichTextEditor.tsx # TipTap editor with toolbar
│       └── pages/
│           ├── Home.tsx           # Project dashboard (card grid)
│           ├── ProjectDetail.tsx  # Tabbed project view + status picker
│           ├── Archives.tsx       # Archived projects + restore
│           ├── NotesList.tsx      # Notes list for a project
│           └── NoteDetail.tsx     # Note view/edit page
│
└── server/                        # Express backend
    └── src/
        ├── models/
        │   ├── Project.ts         # Project schema (timer, files, env, pricing, status)
        │   └── Note.ts            # Note schema
        ├── routes/
        │   ├── projects.ts        # CRUD + timer + files + env + pricing + archive routes
        │   └── notes.ts           # CRUD routes for notes
        └── index.ts               # Express app entry point
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier works)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd project-tracker
npm run install:all
```

This installs dependencies for the root, server, and client in one command.

### 2. Configure the server

Create `server/.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/project-tracker?retryWrites=true&w=majority
PORT=5000
```

> **Getting your URI:** In MongoDB Atlas → your cluster → Connect → Drivers → copy the connection string, then replace `<password>` with your database user's password.

### 3. Start the app

```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |

The Vite dev server proxies all `/api` requests to the Express server automatically.

---

## API Reference

### Projects

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List all active projects |
| `GET` | `/api/projects/archived` | List all archived projects |
| `GET` | `/api/projects/:id` | Get single project |
| `POST` | `/api/projects` | Create project |
| `PATCH` | `/api/projects/:id` | Update project fields (name, brief, status, etc.) |
| `DELETE` | `/api/projects/:id` | Archive project (soft delete) |
| `PATCH` | `/api/projects/:id/restore` | Restore an archived project |
| `POST` | `/api/projects/:id/timer/start` | Start timer |
| `POST` | `/api/projects/:id/timer/pause` | Pause timer (saves elapsed time) |
| `POST` | `/api/projects/:id/timer/stop` | Stop and reset timer |
| `POST` | `/api/projects/:id/config-files` | Add config file |
| `DELETE` | `/api/projects/:id/config-files/:fileId` | Remove config file |
| `POST` | `/api/projects/:id/env-variables` | Add env variable |
| `DELETE` | `/api/projects/:id/env-variables/:varId` | Remove env variable |
| `PATCH` | `/api/projects/:id/pricing` | Update pricing settings |
| `POST` | `/api/projects/:id/pricing/hourly-payment` | Add hourly payment entry |
| `PATCH` | `/api/projects/:id/pricing/hourly-payment/:payId` | Update hourly payment |

### Notes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notes/project/:projectId` | List notes for a project |
| `GET` | `/api/notes/:id` | Get single note |
| `POST` | `/api/notes` | Create note |
| `PATCH` | `/api/notes/:id` | Update note |
| `DELETE` | `/api/notes/:id` | Delete note |

### Project Status Values

| Value | Label | Use when |
|---|---|---|
| `planning` | Planning | Project scoped but not started |
| `ongoing` | Ongoing | Currently being worked on (default) |
| `on-hold` | On Hold | Temporarily paused |
| `completed` | Completed | Delivered / finished |
| `abandoned` | No Longer Needed | Cancelled or deprioritised |

---

## User Flow

```
Home (dashboard)
 └── Add new project ──► dashboard card appears (status: Ongoing)
      └── Click project ──► Project Detail (tabbed)
           ├── Change status ──► dropdown picker in header
           ├── Timer tab      Start → Pause → Resume → Stop
           ├── Notes tab ──► Notes List
           │                   └── Click note ──► Note Detail (view / edit)
           │                   └── New Note   ──► Note Detail (edit mode)
           ├── Config Files   Add .env, firebase.json, etc.
           ├── Env Vars       Add KEY=VALUE pairs (or paste a .env block)
           ├── Pricing        Set fixed/hourly → track payments → mark received
           └── Archive button ──► project moves to Archives page
                                   └── Restore ──► back on dashboard
```

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start both client and server in dev mode |
| `npm run install:all` | Install dependencies for root + server + client |
| `npm run build` | Build client (Vite) and server (tsc) for production |

Run from the **root** `project-tracker/` directory.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `PORT` | No | Server port (default: `5000`) |

---

## Production Deployment

### Option 1: Single VPS (e.g. DigitalOcean, Hetzner)
1. `npm run build` to compile both client and server
2. Serve `client/dist` as static files via Nginx
3. Run the server with `node server/dist/index.js` via PM2

### Option 2: Split deployment
- **Frontend** → Vercel or Netlify (`client/` directory, build command: `npm run build`)
- **Backend** → Railway, Render, or Fly.io (`server/` directory)
- Set `VITE_API_URL` in the client if the API URL differs from the proxy default

---

## Contributing

Contributions are welcome. Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: describe your change"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please keep PRs focused — one feature or fix per PR. For major changes, open an issue first.

### Ideas for contributions
- Export notes as PDF or Markdown
- CSV export for time logs and payment data
- Search and filter on the project dashboard
- Drag-to-reorder projects
- Project tags / categories
- Due date per project with overdue highlight
- Activity log / changelog per project

---

## License

MIT — see [LICENSE](./LICENSE) for details.
