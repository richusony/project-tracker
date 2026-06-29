# Project Tracker

A full-stack personal project management tool built to track everything that matters while you're building — time spent, config files, environment variables, client notes, and payment status.

![Tech Stack](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript) ![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat&logo=tailwindcss) ![License](https://img.shields.io/badge/license-MIT-green?style=flat)

---

## Features

### Project Management
- Create projects with a name and optional description
- View all projects on a dashboard with live timer status
- Delete projects with a single click

### Time Tracker
- **Start / Pause / Resume / Stop** controls
- Live days · hours · minutes · seconds display
- Timer persists across page refreshes and browser sessions — stored in the database so no time is ever lost

### Config File Storage
- Paste the full content of any config file (`.env`, `firebase.json`, `nginx.conf`, etc.) with its file path
- Files are stored securely in your database, not on disk
- Collapsible file viewer with syntax-highlighted content
- Delete individual files at any time

### Environment Variables
- Add key/value pairs directly without needing a file
- Values are masked by default with a show/hide toggle
- Useful when sharing a project setup without exposing secrets

### Notes (Rich Text Editor)
- Full **TipTap**-powered editor with a toolbar supporting:
  - Bold, Italic
  - Headings (H1, H2, H3)
  - Bullet and ordered lists
  - Blockquotes and inline code
  - Clickable hyperlinks
  - **Embedded YouTube video previews** (paste a YouTube URL and it renders inline)
- Each note stores **created** and **updated** timestamps
- Notes are scoped per project — no cross-project clutter
- View, edit, and update notes from a dedicated detail page

### Pricing & Payment Tracking
- Choose between **Fixed Price** or **Hourly Rate** billing
- **Fixed Price** supports:
  - Total project price
  - Advance payment with "Mark as Received" + calendar date picker
  - Final payment with "Mark as Received" + calendar date picker
- **Hourly Rate** supports:
  - Set your hourly rate
  - Log individual payment entries with descriptions
  - Mark each payment received with a date
- **8 currencies supported:** USD, EUR, GBP, AED, SGD, AUD, CAD, INR
- **Live INR conversion** — any non-INR amount shows the equivalent in Indian Rupees using a real-time exchange rate

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
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
│   └── src/
│       ├── api/index.ts           # All API calls (Axios)
│       ├── types/index.ts         # Shared TypeScript interfaces
│       ├── components/
│       │   ├── Layout.tsx         # App shell with header
│       │   ├── AddProjectModal.tsx
│       │   ├── Timer.tsx          # Live timer with controls
│       │   ├── ConfigFiles.tsx    # File upload + viewer
│       │   ├── EnvVariables.tsx   # Key/value env manager
│       │   ├── Pricing.tsx        # Payment tracking + INR conversion
│       │   └── RichTextEditor.tsx # TipTap editor with toolbar
│       └── pages/
│           ├── Home.tsx           # Project dashboard
│           ├── ProjectDetail.tsx  # Tabbed project view
│           ├── NotesList.tsx      # Notes list for a project
│           └── NoteDetail.tsx     # Note view/edit page
│
└── server/                        # Express backend
    └── src/
        ├── models/
        │   ├── Project.ts         # Project + timer + files + pricing schema
        │   └── Note.ts            # Note schema
        ├── routes/
        │   ├── projects.ts        # CRUD + timer + files + env + pricing routes
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

Create `server/.env` (copy from the example):

```bash
cp server/.env.example server/.env
```

Then open `server/.env` and add your MongoDB Atlas connection string:

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

The Vite dev server proxies all `/api` requests to the Express server automatically — no CORS issues in development.

---

## API Reference

### Projects

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List all projects |
| `GET` | `/api/projects/:id` | Get single project |
| `POST` | `/api/projects` | Create project |
| `PATCH` | `/api/projects/:id` | Update project fields |
| `DELETE` | `/api/projects/:id` | Delete project |
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
| `PATCH` | `/api/notes/:id` | Update note (saves `updatedAt`) |
| `DELETE` | `/api/notes/:id` | Delete note |

---

## User Flow

```
Home (dashboard)
 └── Add new project ──► dashboard card appears
      └── Click project ──► Project Detail (tabbed)
           ├── Timer tab      Start → Pause → Resume → Stop
           ├── Notes tab ──► Notes List
           │                   └── Click note ──► Note Detail (view / edit)
           │                   └── New Note ──► Note Detail (edit mode)
           ├── Config Files   Add .env, firebase.json, etc.
           ├── Env Vars       Add KEY=VALUE pairs
           └── Pricing        Set fixed/hourly → track payments → mark received
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
- Set `VITE_API_URL` in the client if the API URL changes from the proxy default

---

## Contributing

Contributions are welcome. Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please keep PRs focused — one feature or fix per PR. For major changes, open an issue first to discuss the approach.

### Ideas for contributions
- Dark/light theme toggle
- Project status labels (In Progress, On Hold, Completed)
- Export notes as PDF
- CSV export for time and payment data
- Search and filter on the project dashboard
- Drag-to-reorder projects

---

## License

MIT — see [LICENSE](./LICENSE) for details.
