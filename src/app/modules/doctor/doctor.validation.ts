import { Gender } from "@prisma/client";
import { z } from "zod";

const createDoctorSchema = z.object({
  body: z.object({
    password: z.string().max(20).optional(),
    doctor: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email format"),
      phone: z.string().min(1, "Phone is required"),
      address: z.string().nullable().optional(),
      registrationNumber: z.string().min(1, "Registration number is required"),
      experience: z
        .number()
        .int("Experience must be integer")
        .nonnegative("Experience cannot be negative")
        .default(0),
      gender: z.enum(Gender),
      appointmentFee: z
        .number()
        .int("Appointment fee must be integer")
        .nonnegative("Appointment fee cannot be negative"),
      qualification: z.string().min(1, "Qualification is required"),
      currentWorkingPlace: z.string().min(1, "Working place is required"),
      designation: z.string().min(1, "Designation is required"),
    }),
  }),
});

const updateDoctorSchema = z.object({
  body: z.object({
    doctor: z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      registrationNumber: z.string().optional(),
      experience: z.number().optional(),
      gender: z.enum(Gender).optional(),
      appointmentFee: z.number().optional(),
      qualification: z.string().optional(),
      currentWorkingPlace: z.string().optional(),
      designation: z.string().optional(),
      specialties: z
        .array(
          z.object({
            specialtiesId: z.string(),
            isDeleted: z.boolean().optional(),
          })
        )
        .optional(),
    }),
  }),
});


const updateDoctorSpecialtiesSchema = z.object({
  body: z.object({
    specialties: z.array(
      z.object({
        specialtiesId: z.string(),
        isDeleted: z.boolean().optional(),
      })
    ),
  }),
});

export const DoctorValidations = {
  createDoctorSchema,
  updateDoctorSchema,
  updateDoctorSpecialtiesSchema,
};

