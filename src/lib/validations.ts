import { z } from "zod";

const ALLOWED_EMAIL_DOMAIN = "@s.wu.ac.at";

export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Ungültige E-Mail-Adresse" })
  .refine((email) => email.endsWith(ALLOWED_EMAIL_DOMAIN), {
    message: `Nur ${ALLOWED_EMAIL_DOMAIN} E-Mail-Adressen erlaubt.`,
  });

export const passwordSchema = z
  .string()
  .min(8, { message: "Passwort muss mindestens 8 Zeichen haben" })
  .regex(/[0-9]/, { message: "Passwort muss mindestens 1 Zahl enthalten" })
  .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Passwort muss mindestens 1 Sonderzeichen enthalten" });

export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type AuthFormData = z.infer<typeof authSchema>;
