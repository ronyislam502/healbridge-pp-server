"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminValidations = exports.updateAdminValidationSchema = exports.createAdminValidationSchema = void 0;
const zod_1 = require("zod");
exports.createAdminValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z.string().max(20).optional(),
        admin: zod_1.z.object({
            name: zod_1.z.string({
                invalid_type_error: "Name must be string",
            }),
            email: zod_1.z.string({
                required_error: "Email is required",
            }),
            phone: zod_1.z.string({ required_error: "Phone is required" }),
        }),
    }),
});
exports.updateAdminValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        admin: zod_1.z
            .object({
            name: zod_1.z
                .string({ invalid_type_error: "Name must be string" })
                .optional(),
            phone: zod_1.z
                .string({ invalid_type_error: "Phone must be string" })
                .optional(),
        })
            .strict(),
    }),
});
exports.AdminValidations = {
    createAdminValidationSchema: exports.createAdminValidationSchema,
    updateAdminValidationSchema: exports.updateAdminValidationSchema,
};
