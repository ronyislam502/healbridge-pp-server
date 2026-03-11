import { z } from "zod";

export const createAdminValidationSchema = z.object({
  body: z.object({
    password: z.string().max(20).optional(),
    admin: z.object({
      name: z.string({
        invalid_type_error: "Name must be string",
      }),
      email: z.string({
        required_error: "Email is required",
      }),
      phone: z.string({ required_error: "Phone is required" }),
    }),
  }),
});

export const updateAdminValidationSchema = z.object({
  body: z.object({
    admin: z
      .object({
        name: z
          .string({ invalid_type_error: "Name must be string" })
          .optional(),
        phone: z
          .string({ invalid_type_error: "Phone must be string" })
          .optional(),
      })
      .strict(),
  }),
});

export const AdminValidations = {
  createAdminValidationSchema,
  updateAdminValidationSchema,
};
