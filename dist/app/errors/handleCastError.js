"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const handlePrismaCastError = (error) => {
    var _a;
    // Handle only Prisma cast error (P2023)
    const errorSources = [
        {
            path: ((_a = error.meta) === null || _a === void 0 ? void 0 : _a.field_name) || "",
            message: error.message || "Invalid value or type for field",
        },
    ];
    return {
        statusCode: http_status_1.default.BAD_REQUEST,
        message: "Invalid Error",
        errorSources,
    };
};
exports.default = handlePrismaCastError;
