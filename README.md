<p align="center">
  <img src="public/icons/icon.svg" width="250" alt="app icon">
</p>

# Scrollpedia

Scrollpedia is a mobile-first React/Vite PWA that feels like a TikTok-style scrolling app, except the content is informative Wikipedia articles.

The app supports German and English, includes installability through manifest.webmanifest, and offers two separate browsing modes:

- topic-based discovery feed
- Popular Wikipedia Pages based on Wikimedia most-viewed data

## Features

- mobile-first Wikipedia browsing experience
- German and English language support
- topic selection with a separate popular feed mode
- article cards with thumbnails, summaries, and detail view
- installable PWA with manifest support
- local preference persistence for language, feed mode, and selected topics

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Wikimedia / Wikipedia APIs

## Getting Started

### Prerequisites

- Node.js
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

## Project Structure

- `src/` application code, UI components, feed logic, and Wikipedia API integration
- `public/` icons, images, install-guide assets, and `manifest.webmanifest`
- `dist/` generated production build output
- `index.html` app entry HTML
- `package.json` scripts and dependencies
