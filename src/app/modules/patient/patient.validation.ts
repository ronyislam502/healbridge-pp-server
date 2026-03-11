import { z } from "zod";

export const createPatientValidationSchema = z.object({
  body: z.object({
    password: z.string().max(20).optional(),
    patient: z.object({
      name: z.string({
        invalid_type_error: "Name must be string",
      }),
      email: z.string({
        required_error: "Email is required",
      }),
      phone: z.string({
        required_error: "Phone is required",
      }),
      address: z.string({
        required_error: "Address is required",
      }),
    }),
  }),
});

export const PatientValidations = { createPatientValidationSchema };
