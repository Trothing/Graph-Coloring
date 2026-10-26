# Theme

## Token summary
- Dark navy slate theme (Tailwind slate-like): bg #0f172a, surface #162032, elevated #1e293b, borders #1e293b / #334155
- Text: #f1f5f9 / #94a3b8 / #475569
- Accent: blue #2563eb (hover #1d4ed8, text #93c5fd). Success #10b981, error #f43f5e, warn #f59e0b
- Fonts: system-ui sans for UI, Geist Mono for numbers/labels/log (Google Fonts import)
- Radius: 4 / 6 / 8px. Base font 13px. Transition 0.15s ease
- Vertex palette (32 colours, Tailwind -500 hues: blue, emerald, amber, red, violet, cyan, orange, lime, pink, teal ...) used for colour classes; vertex radius 19; vertex fill = colour at 15% alpha, stroke = colour
- Breakpoints: none (desktop-only, fixed 280px sidebar, fixed 192px bottom bar)
- Styling: SCSS modules + CSS variables in `:root` inside `src/App.module.scss`

## Raw source
### `src/App.module.scss`

```scss
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500&display=swap');

:root {
  --bg: #0f172a;
  --bg-elevated: #1e293b;
  --bg-surface: #162032;
  --bg-hover: rgba(255, 255, 255, 0.04);
  --bg-active: rgba(37, 99, 235, 0.1);

  --border: #1e293b;
  --border-strong: #334155;
  --border-accent: rgba(37, 99, 235, 0.5);

  --text-1: #f1f5f9;
  --text-2: #94a3b8;
  --text-3: #475569;

  --accent: #2563eb;
  --accent-hover: #1d4ed8;
  --accent-dim: rgba(37, 99, 235, 0.12);
  --accent-text: #93c5fd;

  --success: #10b981;
  --success-dim: rgba(16, 185, 129, 0.1);
  --error: #f43f5e;
  --error-dim: rgba(244, 63, 94, 0.1);
  --warn: #f59e0b;
  --warn-dim: rgba(245, 158, 11, 0.1);

  --font-ui: system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, 'SF Mono', 'Fira Code', monospace;

  --radius-sm: 4px;
  --radius: 6px;
  --radius-lg: 8px;

  --ease: 0.15s ease;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
button { border: none; background: none; cursor: pointer; font: inherit; }

.app {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
  font-family: var(--font-ui);
  font-size: 13px;
  color: var(--text-1);
  line-height: 1.5;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.canvasArea {
  flex: 1;
  position: relative;
  overflow: hidden;
  border-left: 1px solid var(--border);
}

.bottomBar {
  display: flex;
  height: 192px;
  flex-shrink: 0;
  border-top: 1px solid var(--border);
  border-left: 1px solid var(--border);
}

.statsArea {
  flex: 1;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  overflow: hidden;
}

.logArea {
  flex: 1.5;
  min-width: 0;
  overflow: hidden;
}

```

### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>graph-coloring</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```

### `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

```

### `package.json`

```json
{
  "name": "graph-coloring",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "sass": "^1.99.0"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/node": "^24.12.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.2.1",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.5.0",
    "typescript": "~6.0.2",
    "typescript-eslint": "^8.58.2",
    "vite": "^8.0.10"
  }
}

```

