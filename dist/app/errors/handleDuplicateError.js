"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const handleDuplicateError = (error) => {
    var _a, _b, _c;
    const statusCode = http_status_1.default.BAD_REQUEST;
    // Check if Prisma duplicate error (P2002)
    if (error.code === "P2002") {
        const fieldName = (_c = (_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b[0]) !== null && _c !== void 0 ? _c : "field";
        const errorSources = [
            {
                path: fieldName,
                message: `${fieldName} already exists`,
            },
        ];
        return {
            statusCode,
            message: `${fieldName} already exists`,
            errorSources,
        };
    }
    // Fallback: unknown structure
    const errorSources = [
        {
            path: "",
            message: "Duplicate entry",
        },
    ];
    return {
        statusCode,
        message: "Duplicate entry",
        errorSources,
    };
};
exports.default = handleDuplicateError;
