# Takshara

An AI-powered academic management platform for students. Takshara helps students organize their academic life with intelligent scheduling, note-taking, and an AI assistant that can answer questions about their coursework.

## 📚 Features

- **AI Assistant**: Multi-provider AI chat (Gemini, XAI, Groq) for academic help
- **Smart Notes**: Create, edit, and organize study notes with rich text
- **Timetable Management**: Visual schedule planning and conflict detection
- **Dashboard**: Personalized overview of tasks, schedules, and progress
- **Authentication**: Secure email/password auth via Supabase
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Mode**: Beautiful glassmorphism UI with aurora backgrounds

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Zustand** for state management
- **React Router** for navigation
- **React Hot Toast** for notifications
- **Framer Motion** for animations
- **TanStack Query** for data fetching

### Backend
- **Supabase** (PostgreSQL, Auth, Edge Functions)
- **Supabase Edge Functions** (Deno runtime)
  - `ai-chat` - AI conversation endpoint
  - `ai-files` - File processing
  - `ai-action` - Action execution
  - `ai-gateway` - Provider routing

### AI Providers
- Google Gemini
- XAI (Grok)
- Groq

### Deployment
- **Vercel** (Frontend)
- **Supabase** (Backend & Database)

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase CLI
- Git

### Clone the Repository
```bash
git clone https://github.com/vanisri6396-hue/takshara.git
cd takshara
```

### Install Dependencies
```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend
npm install
```

## 🔧 Environment Setup

### Frontend Environment
Copy the example environment file and fill in your Supabase credentials:

```bash
cd frontend
cp .env.example .env
```

Edit `.env` with your values:
```env
# Supabase project URL
VITE_SUPABASE_URL=https://your-project.supabase.co

# Supabase anonymous (public) key
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run database migrations:
   ```bash
   cd database
   # Apply migrations in order (001 through 008)
   ```
3. Set up Edge Functions secrets:
   ```bash
   supabase secrets set GEMINI_API_KEY=your-key
   supabase secrets set XAI_API_KEY=your-key
   supabase secrets set GROQ_API_KEY=your-key
   ```

## 💻 Running Locally

### Frontend Development Server
```bash
cd frontend
npm run dev
```
The app will be available at `http://localhost:5173`

### Supabase Local Development
```bash
supabase start
supabase functions serve
```

### Build for Production
```bash
cd frontend
npm run build
npm run preview
```

## 🌐 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/dist`
4. Add environment variables from `.env.example`

### Backend (Supabase)
1. Link your project: `supabase link --project-ref your-ref`
2. Deploy functions: `supabase functions deploy`
3. Run migrations: `supabase db push`

## 📁 Project Structure

```
takshara/
├── frontend/          # React + TypeScript + Vite app
│   ├── src/
│   │   ├── features/  # Feature-based modules
│   │   ├── components/# Reusable UI components
│   │   ├── lib/       # Utilities and constants
│   │   ├── stores/    # Zustand state
│   │   └── routes/    # Routing configuration
│   └── public/        # Static assets
├── supabase/          # Backend functions and config
│   └── functions/     # Edge Functions
├── database/          # SQL migrations
├── backend/           # Backend documentation
├── docs/              # Project documentation
└── assets/            # Logo and UI assets
```

## 🔒 Security

- All secrets are stored in environment variables (never committed)
- Supabase RLS (Row Level Security) protects database access
- AI API keys are server-side only (Edge Functions)
- `.env` files are gitignored

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Made with ❤️ for students everywhere.