"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("../config"));
// Custom AppError
const AppError_1 = __importDefault(require("../errors/AppError"));
const handleZodError_1 = __importDefault(require("../errors/handleZodError"));
const handleValidationError_1 = __importDefault(require("../errors/handleValidationError"));
const handleCastError_1 = __importDefault(require("../errors/handleCastError"));
const handleDuplicateError_1 = __importDefault(require("../errors/handleDuplicateError"));
const globalErrorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = "Something went wrong";
    let errorSources = [
        {
            path: req.originalUrl || "",
            message: "Something went wrong",
        },
    ];
    // Helper function to set error details from a handler result
    const setError = (simplifiedError) => {
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    };
    if (error instanceof zod_1.ZodError) {
        setError((0, handleZodError_1.default)(error));
    }
    else if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        setError((0, handleValidationError_1.default)(error));
    }
    else if (error.code === "P2000" ||
        error.code === "P2018" ||
        error.code === "P2003" ||
        error.code === "P2025") {
        setError((0, handleValidationError_1.default)(error));
    }
    else if (error.code === "P2023") {
        setError((0, handleCastError_1.default)(error));
    }
    else if (error.code === "P2002") {
        setError((0, handleDuplicateError_1.default)(error));
    }
    else if (error instanceof AppError_1.default) {
        statusCode = error.statusCode;
        message = error.message;
        errorSources = [
            {
                path: req.originalUrl || "",
                message: error.message,
            },
        ];
    }
    else if (error instanceof Error) {
        message = error.message;
        errorSources = [
            {
                path: req.originalUrl || "",
                message: error.message,
            },
        ];
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        stack: config_1.default.node_env === "development" ? error.stack : null,
    });
};
exports.default = globalErrorHandler;
