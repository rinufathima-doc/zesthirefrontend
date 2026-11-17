import { z } from 'zod';

export const jobSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters long'),
  companyName: z.string().min(2, 'Company name is required'),
  location: z.string().min(2, 'Location is required'),
  jobType: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']),
  salary: z.string().min(1, 'Salary details are required'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
});