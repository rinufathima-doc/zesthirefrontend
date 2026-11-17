import { z } from "zod";

export const candidateProfileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  headline: z.string().min(5, "Headline (e.g., Full-Stack Developer) is required"),
  phone: z.string().min(10, "Valid contact number is required"),
  bio: z.string().max(500, "Bio must not exceed 500 characters").optional(),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  resumeUrl: z.string().optional(),
});

export type CandidateProfileValues = z.infer<typeof candidateProfileSchema>;