import { z } from "zod";

export const loginBodySchemaSimple = z.object({
  email: z.email("Invalid email address format").nonempty(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must not exceed 128 characters"),
});
