# SKA Science Regional Centre (SNH) Helpdesk Dashboard

A modern, high-performance web dashboard for reviewing SKA Science Regional Centre (SNH) Jira helpdesk tickets, managing daily duty exception lists, and executing monthly PI periodic hygiene sweeps.

## Key Features

- **Card Boxes View**: Categorized exception cards (Unassigned, Acceptance Pending, High Impact, Inactivity, Blockers, Cross-Node, Closure Candidates, Status/Ageing timelines, Key Areas, and Assignees).
- **Interactive Ticket Modal**: Click on any box category to pop up a detailed ticket overlay with direct clickable links to Jira issues.
- **Periodic Hygiene Sweep**: Built-in tools for monthly PI reviews (Retain, Close, Merge, Convert).
- **Client-Side Auth Isolation**: User tokens are held purely in local memory state for maximum security and multi-user isolation.

---

## 🐳 Docker Deployment

### 1. Quick Start with Docker Compose

To build and run the containerized application on port `8080`:

```bash
docker-compose up -d --build
```

Access the dashboard in your browser at:  
👉 **`http://localhost:8080`**

To stop the container:
```bash
docker-compose down
```

### 2. Manual Docker Build & Run

Build the Docker image using the multi-stage `Dockerfile`:

```bash
docker build -t jira-helpdesk-dashboard .
```

Run the container:

```bash
docker run -d -p 8080:80 --name jira_helpdesk_dashboard jira-helpdesk-dashboard
```

---

## 🛠 Local Development

### Prerequisites
- Node.js 18+
- npm

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

3. Run linter:
   ```bash
   npm run lint
   ```

---

## 🔐 Security & Auth Model

- **Memory-Only State**: Tokens and credentials entered into the login modal are stored exclusively in client-side React state.
- **Isolated Sessions**: Multiple users accessing the same deployed URL will be prompted for their own individual credentials. No session tokens are persisted in `localStorage` or shared backend databases.
