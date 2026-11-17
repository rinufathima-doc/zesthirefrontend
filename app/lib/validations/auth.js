import { z } from "zod";

// Reusable strong password validation rule
const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character (e.g. @, #, $, !, %)"
  );

// ==========================================
// EMPLOYER SIGNUP SCHEMA
// ==========================================
export const employerSignupSchema = z
  .object({
    companyName: z
      .string()
      .min(2, "Company name must be at least 2 characters"),
    contactName: z
      .string()
      .min(2, "Contact name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid work email address"),
    industry: z
      .string()
      .min(2, "Industry is required"),
    companyWebsite: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.startsWith("http://") || val.startsWith("https://"),
        { message: "Website must start with http:// or https://" }
      ),
    password: passwordValidation,
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ==========================================
// JOBSEEKER SIGNUP SCHEMA
// ==========================================
export const jobseekerSignupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits"),
    title: z
      .string()
      .min(2, "Professional title is required (e.g. Frontend Developer)"),
    password: passwordValidation,
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ==========================================
// JOBSEEKER PROFILE SCHEMA
// ==========================================
export const jobseekerProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  title: z.string().min(2, "Professional title is required"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  skills: z.string().min(2, "Enter at least one skill (comma-separated)"),
  experience: z.string().min(1, "Experience level is required"),
  githubUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.startsWith("http://") || val.startsWith("https://"),
      { message: "URL must start with http:// or https://" }
    ),
  linkedinUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.startsWith("http://") || val.startsWith("https://"),
      { message: "URL must start with http:// or https://" }
    ),
});