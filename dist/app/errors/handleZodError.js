"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const handleZodError = (error) => {
    const errorSources = error.issues.map((issue) => {
        return {
            // path: issue?.path[issue.path.length - 1],
            path: issue === null || issue === void 0 ? void 0 : issue.path.join("."),
            message: issue === null || issue === void 0 ? void 0 : issue.message,
        };
    });
    const statusCode = http_status_1.default.BAD_REQUEST;
    return {
        statusCode,
        message: "Validation error",
        errorSources,
    };
};
exports.default = handleZodError;
