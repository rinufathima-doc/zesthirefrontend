import { z } from 'zod';

export const applicationSchema = z.object({
  resumeLink: z
    .string()
    .min(1, 'Resume link is required')
    .url('Must be a valid URL (e.g. https://example.com/resume.pdf)'),
  coverLetter: z
    .string()
    .min(10, 'Cover letter must be at least 10 characters long')
    .max(1000, 'Cover letter cannot exceed 1000 characters'),
});