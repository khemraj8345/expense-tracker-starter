# Repository Guidelines

## Project Structure & Module Organization

This repository is a small React expense tracker built with Vite. The application entry point is `src/main.jsx`; `src/App.jsx` composes the main screen. Feature components live in `src/components/`, shared category values in `src/constants/categories.js`, and styles in `src/App.css` and `src/index.css`. Place imported source assets in `src/assets/` and static files served directly in `public/`. There is currently no test directory or test framework.

## Architecture Overview

`App` owns the transaction collection and adds validated transactions through a callback. `Summary` derives income, expenses, and balance from that collection. `TransactionForm` owns its input state and submits a normalized transaction to `App`; `TransactionList` owns its type and category filters and renders matching rows. Keep the category options centralized in `src/constants/categories.js` so the form and list use the same values. Pass data and callbacks through props rather than sharing feature state between components.

## Build, Test, and Development Commands

- `npm install` installs dependencies from `package-lock.json`.
- `npm run dev` starts the local Vite development server, usually at `http://localhost:5173`.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview` serves the built bundle locally for inspection.
- `npm run lint` runs ESLint across the project.

Run `npm run lint` and `npm run build` before submitting changes. Add a test framework and corresponding test script if you introduce behavior that needs automated coverage.

## Coding Style & Naming Conventions

Use the existing JavaScript/JSX style: two-space indentation, single quotes, and semicolons. Use PascalCase for React components, camelCase for variables and functions, and descriptive names for CSS classes. Keep component-specific styles in `App.css` and shared base styles in `index.css`. ESLint enforces JavaScript, React Hooks, and React Refresh rules; resolve lint errors rather than suppressing them without cause.

## Testing Guidelines

No automated test suite is configured yet. For UI changes, run the development server and verify the affected flow in a browser, then run lint and build. If adding tests, use clear names that describe the behavior and document the command used to run them.

## Commit & Pull Request Guidelines

The available Git history contains only an initial commit, so no established commit convention can be inferred. Use concise, imperative messages such as `fix: validate expense amount`. Pull requests should explain the user-visible change, list validation commands and results, link related issues when applicable, and include screenshots for visual changes.

## Security & Configuration

Do not commit credentials, tokens, or local environment files. Keep dependencies managed through `package.json` and `package-lock.json`; review dependency changes before including them.
