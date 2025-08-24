import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().email("Invalid email address format").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must not exceed 128 characters")
    .nonempty("password is required"),
});

export type LoginInput = z.infer<typeof loginBodySchema>;
