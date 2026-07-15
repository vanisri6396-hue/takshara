import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in-up">
        <div className="glass-strong rounded-radius-xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline text-display-lg text-primary-container">404</h1>
              <p className="mt-2 text-body-lg text-on-surface-variant">
                Page not found
              </p>
            </div>
            <div className="rounded-radius-xl gradient-gold/10 glow-gold p-3">
              <span className="block h-10 w-10 rounded-full bg-primary-container/20" />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-radius-lg px-6 py-3 text-label-md font-bold gradient-gold text-on-primary hover:opacity-90 transition-opacity"
            >
              Go to Login
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-radius-lg px-6 py-3 text-label-md font-bold bg-transparent border border-primary-container/40 text-primary-container hover:bg-primary-container/10 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>

          <p className="mt-5 text-label-sm text-on-surface-variant/70">
            The page may have moved, or the link may be incorrect.
          </p>
        </div>
      </div>
    </div>
  )
}
