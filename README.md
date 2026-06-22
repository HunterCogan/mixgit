# Mixgit

**Git-style version control and AI code review for MIT Scratch & more.**

Mixgit is a full-stack web app that brings collaboration, version history, and beginner-friendly code review to [Scratch](https://scratch.mit.edu/) block coding. Students share their work as **Remixes** (an approachable take on branches and pull requests), and Claude AI reads the underlying Scratch logic to give plain-language feedback.

**Live demo:** https://mixgit.tech/

> Built with Next.js, React, TypeScript, MongoDB, Better Auth, and the Anthropic Claude API.

---

## Features

- **Projects & Remixes:** every project starts from a `main` remix. Students upload new versions as Remixes, a student-friendly abstraction of branches and pull requests.
- **Scratch block parser:** reconstructs full program structure from a Scratch `.sb3`'s `project.json`.
- **Scratch block rendering:** parsed scripts are displayed as readable, indented block stacks in the UI.
- **AI code review:** Claude reads the parsed program and returns friendly, structured feedback (what works well, suggestions, logic issues), tuned for 5th–8th-grade readers.
- **Teams & sharing:** invite collaborators to a project and view shared-projects.
- **Auth & accounts:** email/password auth, sessions with 30-day "remember me", and customizable profile.
- **Search:** find users and projects, and view remix/project counts.
- **Privacy-conscious uploads:** device-identifiable metadata is stripped from uploaded projects before storage.

---

## Tech stack

| Layer      | Technology                                 |
| ---------- | ------------------------------------------ |
| Framework  | Next.js 16, React 19                       |
| Language   | TypeScript                                 |
| UI         | Tailwind CSS v4, HeroUI                    |
| Database   | MongoDB (Atlas) via Mongoose               |
| Auth       | Better Auth (email/password, sessions)     |
| Validation | Zod (mirrors the Mongoose models)          |
| AI         | Anthropic Claude API (`@anthropic-ai/sdk`) |
| Testing    | Vitest + jsdom                             |
| Tooling    | ESLint, Prettier, Husky + lint-staged      |
| Deployment | Vercel                                     |

---

## Getting Started ( Dev )

### Prerequisites

- **Node.js** 18+ and npm
- A **MongoDB** connection string (e.g. a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- An **Anthropic API key** ([console.anthropic.com](https://console.anthropic.com/))

### 1. Clone and install

```bash
git clone https://github.com/HunterCogan/scratchpad.git
cd scratchpad
npm install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Generate a `BETTER_AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account, make a project, and upload a Scratch project's `project.json` as a Remix to see AI feedback.
