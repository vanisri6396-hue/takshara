import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="font-headline text-display-lg text-primary-container">404</h1>
      <p className="text-body-lg text-on-surface-variant">Page not found</p>
      <Link
        to="/dashboard"
        className="mt-4 gradient-gold text-on-primary rounded-radius px-6 py-3 font-bold"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}