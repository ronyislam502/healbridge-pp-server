"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorValidations = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const createDoctorSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z.string().max(20).optional(),
        doctor: zod_1.z.object({
            name: zod_1.z.string({
                invalid_type_error: "Name must be string",
            }),
            email: zod_1.z.string({
                invalid_type_error: "Name must be string",
            }),
            phone: zod_1.z.string({ required_error: "Phone is required" }),
            address: zod_1.z
                .string({ required_error: "Address is required" })
                .optional()
                .nullable(),
            registrationNumber: zod_1.z.string({
                required_error: "Registration number is required",
            }),
            experience: zod_1.z
                .number({ required_error: "Experience is required" })
                .int()
                .nonnegative()
                .default(0),
            gender: zod_1.z.nativeEnum(client_1.Gender),
            appointmentFee: zod_1.z
                .number({ required_error: "AppointmentFee is required" })
                .int()
                .nonnegative(),
            qualification: zod_1.z.string({ required_error: "Qualification is required" }),
            currentWorkingPlace: zod_1.z.string({
                required_error: "Current working place is required",
            }),
            designation: zod_1.z.string({ required_error: "Designation is required" }),
        }),
    }),
});
const updateDoctorSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        registrationNumber: zod_1.z.string().optional(),
        experience: zod_1.z.number().optional(),
        gender: zod_1.z.string().optional(),
        appointmentFee: zod_1.z.number().optional(),
        qualification: zod_1.z.string().optional(),
        currentWorkingPlace: zod_1.z.string().optional(),
        designation: zod_1.z.string().optional(),
    }),
});
exports.DoctorValidations = {
    createDoctorSchema,
    updateDoctorSchema,
};
