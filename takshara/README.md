# Takshara Frontend

React + TypeScript + Vite application for the Takshara academic management platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📋 Available Scripts

- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build locally

## 🔧 Environment Variables

Create a `.env` file in this directory (see `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🏗 Project Structure

```
src/
├── features/          # Feature-based modules (auth, dashboard, ai-assistant, etc.)
├── components/        # Reusable UI components (Button, Modal, GlassCard, Logo)
├── lib/               # Utilities, constants, helpers
├── stores/            # Zustand state management
├── routes/            # React Router configuration
├── hooks/             # Custom React hooks
└── styles/            # Global CSS and theme
```

## 🛡 Security Notes

- All `VITE_*` variables are exposed to the browser (public anon key only)
- Never put secret keys in `.env` - use Supabase Edge Functions for server-side secrets
- `.env` is gitignored - never commit real credentials

## 📦 Tech Stack

- React 18 + TypeScript
- Vite 4
- Zustand (state)
- React Router 6
- Framer Motion (animations)
- TanStack Query (data fetching)
- React Hot Toast (notifications)
- Oxlint (linting)