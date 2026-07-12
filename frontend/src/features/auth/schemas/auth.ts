import { z } from 'zod'

export const fullNameSchema = z
  .string()
  .min(1, 'Please enter your full name.')
  .transform((v) => v.trim())
  .pipe(
    z
      .string()
      .min(3, 'Full name must be at least 3 characters.')
      .regex(/^[A-Za-z\s'-]+$/, 'Only letters, spaces, apostrophes, and hyphens are allowed.')
  )

export const emailSchema = z.string().min(1, 'Please enter your email address.').email('Please enter a valid email address.')

export const passwordSchema = z
  .string()
  .min(1, 'Please enter your password.')
  .min(8, 'Password must be at least 8 characters.')
  .max(64, 'Password must be at most 64 characters.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Please enter your password.'),
})

export const registerSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>