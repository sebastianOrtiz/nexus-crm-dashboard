# NexusCRM Dashboard

CRM dashboard built with Angular 21, Tailwind CSS 3, and TypeScript.

## Development server

```bash
npm start
```

Opens at `http://localhost:4200/`. The app reloads automatically on file changes.

### Dev Container / Docker

This project uses the **Webpack builder** (`@angular-devkit/build-angular:browser`) instead of Vite. This is intentional — Vite's dev server relies on WebSockets for ES module loading, which fails silently when ports are forwarded from a dev container (Docker, Codespaces, WSL). The browser loads the HTML but Vite blocks rendering until the WebSocket connects, resulting in an infinite blank page with no errors in the console.

Webpack generates self-contained bundles served over plain HTTP, so port forwarding works without issues.

## Building

```bash
npm run build
```

Build artifacts go to `dist/nexus-crm-dashboard/`.

## i18n

The app supports English and Spanish. Language toggle is available in the topbar (authenticated) and on auth pages (login/register). The preference is persisted in `localStorage` and defaults to the browser language.

Translations are managed in `src/app/core/services/translate.service.ts`.

## Running tests

```bash
npm test
```
