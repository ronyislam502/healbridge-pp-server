import { z } from "zod";


const createPatientValidationSchema = z.object({
  body: z.object({
    password: z.string().max(20).optional(),

    patient: z.object({
      name: z.string().min(1, "Name is required"),

      email: z.string().email("Invalid email format"),

      phone: z.string().min(1, "Phone is required"),

      address: z.string().min(1, "Address is required"),
    }),
  }),
});

export const PatientValidations = { createPatientValidationSchema };
