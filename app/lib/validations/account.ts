import { z } from "zod";

export const accountSettingsSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    currentPassword: z.string().min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
    emailNotifications: z.boolean().default(true),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AccountSettingsValues = z.infer<typeof accountSettingsSchema>;