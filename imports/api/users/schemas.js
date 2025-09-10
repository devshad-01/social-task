import { z } from 'zod';

// Base user schema for validation
export const userSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters")
    .optional(),
  emails: z
    .array(
      z.object({
        address: z.string().email("Invalid email address"),
        verified: z.boolean().default(false),
      })
    )
    .optional(),
  profile: z
    .object({
      firstName: z.string().min(1, "First name is required").max(50, "First name cannot exceed 50 characters"),
      lastName: z.string().min(1, "Last name is required").max(50, "Last name cannot exceed 50 characters"),
      avatar: z.string().url().optional(),
      bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
      role: z.enum(["admin", "team-member"]).default("team-member"),
      settings: z.object({
        notifications: z.boolean().default(true),
        theme: z.enum(["light", "dark", "system"]).default("system")
      }).optional()
    })
    .optional(),
  services: z.object({}).passthrough().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional()
});

// Register schema
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  fullName: z.string().min(1, "Full name is required"),
  agreeToTerms: z.boolean().refine(val => val === true, "You must accept terms and conditions")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Password reset schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address")
});

// Reset password schema
export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Profile update schema
export const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional()
});

// Change password schema
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
});
