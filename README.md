# NexusCRM Dashboard

CRM dashboard built with Angular 21, TypeScript, and Tailwind CSS 3. Mobile-first responsive design with full i18n support (English/Spanish).

## Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Builder | Webpack (see note below) |

## Key Features

- **i18n** -- English and Spanish with language toggle on all pages; persisted in localStorage, defaults to browser language
- **Mobile-first responsive** -- collapsible sidebar, adaptive layouts
- **Kanban board** -- drag-and-drop deal pipeline with stage management
- **Deal stage history** -- full audit trail of deal stage transitions
- **Event service integration** -- displays onboarding flow status and events in real time
- **Semantic search integration** -- document upload, search, and results display
- **Auth** -- login, register, JWT token management with auto-refresh

## Running

```bash
npm install
npm start
```

Opens at `http://localhost:4200/`. The app reloads automatically on file changes.

## Webpack vs Vite

This project uses the **Webpack builder** (`@angular-devkit/build-angular:browser`) instead of Vite. Vite's dev server relies on WebSockets for ES module loading, which fails silently when ports are forwarded from a dev container (Docker, Codespaces, WSL). Webpack generates self-contained bundles served over plain HTTP, so port forwarding works without issues.

## Building

```bash
npm run build
```

Build artifacts go to `dist/nexus-crm-dashboard/`.

## Tests

93 tests.

```bash
npm test
```

## Part of sebasing.dev

| Project | Stack |
|---|---|
| [portfolio-web](../portfolio-web) | Next.js, TypeScript, Tailwind |
| [nexus-crm-api](../nexus-crm-api) | FastAPI, SQLAlchemy, PostgreSQL |
| **nexus-crm-dashboard** (this) | Angular, TypeScript, Tailwind |
| [event-driven-service](../event-driven-service) | Go, Gin, Redis Streams |
| [semantic-search-api](../semantic-search-api) | FastAPI, ChromaDB, sentence-transformers |

## License

MIT
