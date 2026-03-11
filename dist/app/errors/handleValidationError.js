"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const handlePrismaValidationError = (error) => {
    var _a, _b, _c, _d;
    let errorSources = [];
    // Handle known Prisma error codes
    if (error.code === "P2000" ||
        error.code === "P2018" ||
        error.code === "P2003" ||
        error.code === "P2023" ||
        error.code === "P2025") {
        const field = ((_a = error.meta) === null || _a === void 0 ? void 0 : _a.field_name) ||
            ((_b = error.meta) === null || _b === void 0 ? void 0 : _b.constraint_name) ||
            ((_d = (_c = error.meta) === null || _c === void 0 ? void 0 : _c.target) === null || _d === void 0 ? void 0 : _d[0]) ||
            "";
        errorSources.push({
            path: field,
            message: error.message || "Validation failed for field",
        });
        return {
            statusCode: 400,
            message: "Validation Error",
            errorSources,
        };
    }
    // Handle PrismaClientValidationError
    if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        // Regex to extract missing argument name
        const match = error.message.match(/Argument `(\w+)` is missing/);
        const field = match ? match[1] : "";
        errorSources.push({
            path: field,
            message: `${field} is required` || "Prisma validation failed",
        });
        return {
            statusCode: 400,
            message: "Validation Error",
            errorSources,
        };
    }
    // Fallback for other formats (e.g. nested error.errors object)
    if (error.errors && typeof error.errors === "object") {
        errorSources = Object.values(error.errors).map((val) => ({
            path: val.path || "",
            message: val.message || "Validation error",
        }));
    }
    else {
        errorSources.push({
            path: "",
            message: error.message || "Unknown validation error",
        });
    }
    return {
        statusCode: 400,
        message: "Validation Error",
        errorSources,
    };
};
exports.default = handlePrismaValidationError;
