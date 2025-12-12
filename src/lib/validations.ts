import { z } from "zod";

// For testing: @gmail.com allowed. Change to @s.wu.ac.at for production
const ALLOWED_EMAIL_DOMAIN = "@gmail.com";

export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Ungültige E-Mail-Adresse" })
  .refine((email) => email.endsWith(ALLOWED_EMAIL_DOMAIN), {
    message: `Nur ${ALLOWED_EMAIL_DOMAIN} E-Mail-Adressen erlaubt.`,
  });

export const passwordSchema = z
  .string()
  .min(8, { message: "Passwort muss mindestens 8 Zeichen haben" });

export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type AuthFormData = z.infer<typeof authSchema>;
