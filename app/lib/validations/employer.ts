import { z } from "zod";

export const employerProfileSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  website: z.string().url("Please enter a valid URL"),
  industry: z.string().min(1, "Please select an industry"),
  companySize: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]),
  about: z.string().min(50, "About section should be at least 50 characters"),
  location: z.string().min(2, "Headquarters location is required"),
  logoUrl: z.string().optional(),
});

export type EmployerProfileValues = z.infer<typeof employerProfileSchema>;