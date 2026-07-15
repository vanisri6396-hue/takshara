import { useReducedMotion } from 'framer-motion'

export function usePrefersReducedMotion(): boolean {
  const reduced = useReducedMotion()
  return reduced ?? false
}