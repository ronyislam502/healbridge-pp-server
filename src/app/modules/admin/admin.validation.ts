import { z } from "zod";

export const createAdminValidationSchema = z.object({
  body: z.object({
    password: z.string().max(20).optional(),

    admin: z.object({
      name: z
        .string()
        .min(1, "Name is required"),

      email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email format"),

      phone: z
        .string()
        .min(1, "Phone is required"),
    }),
  }),
});

export const updateAdminValidationSchema = z.object({
  body: z.object({
    admin: z
      .object({
        name: z
          .string()
          .min(1, "Name cannot be empty")
          .optional(),

        phone: z
          .string()
          .min(1, "Phone cannot be empty")
          .optional(),
      })
      .strict(),
  }),
});

export const AdminValidations = {
  createAdminValidationSchema,
  updateAdminValidationSchema,
};