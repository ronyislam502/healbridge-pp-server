import { Gender } from "@prisma/client";
import { z } from "zod";

const createDoctorSchema = z.object({
  body: z.object({
    password: z.string().max(20).optional(),
    doctor: z.object({
      name: z.string({
        invalid_type_error: "Name must be string",
      }),
      email: z.string({
        invalid_type_error: "Name must be string",
      }),
      phone: z.string({ required_error: "Phone is required" }),
      address: z
        .string({ required_error: "Address is required" })
        .optional()
        .nullable(),
      registrationNumber: z.string({
        required_error: "Registration number is required",
      }),
      experience: z
        .number({ required_error: "Experience is required" })
        .int()
        .nonnegative()
        .default(0),
      gender: z.nativeEnum(Gender),
      appointmentFee: z
        .number({ required_error: "AppointmentFee is required" })
        .int()
        .nonnegative(),
      qualification: z.string({ required_error: "Qualification is required" }),
      currentWorkingPlace: z.string({
        required_error: "Current working place is required",
      }),
      designation: z.string({ required_error: "Designation is required" }),
    }),
  }),
});

const updateDoctorSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    registrationNumber: z.string().optional(),
    experience: z.number().optional(),
    gender: z.string().optional(),
    appointmentFee: z.number().optional(),
    qualification: z.string().optional(),
    currentWorkingPlace: z.string().optional(),
    designation: z.string().optional(),
  }),
});

export const DoctorValidations = {
  createDoctorSchema,
  updateDoctorSchema,
};
