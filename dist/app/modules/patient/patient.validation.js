"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientValidations = exports.createPatientValidationSchema = void 0;
const zod_1 = require("zod");
exports.createPatientValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z.string().max(20).optional(),
        patient: zod_1.z.object({
            name: zod_1.z.string({
                invalid_type_error: "Name must be string",
            }),
            email: zod_1.z.string({
                required_error: "Email is required",
            }),
            phone: zod_1.z.string({
                required_error: "Phone is required",
            }),
            address: zod_1.z.string({
                required_error: "Address is required",
            }),
        }),
    }),
});
exports.PatientValidations = { createPatientValidationSchema: exports.createPatientValidationSchema };
