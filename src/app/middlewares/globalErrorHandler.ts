/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { TErrorSources } from "../interface/error";
import handleZodError from "../error/handleZodError";
import handlePrismaValidationError from "../error/handleValidationError";
import handlePrismaCastError from "../error/handleCastError";
import handleDuplicateError from "../error/handleDuplicateError";
import AppError from "../error/AppError";
import config from "../../config";

// Custom AppError


const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let errorSources: TErrorSources = [
    {
      path: req.originalUrl || "",
      message: "Something went wrong",
    },
  ];

  // Helper function to set error details from a handler result
  const setError = (simplifiedError: {
    statusCode: number;
    message: string;
    errorSources: TErrorSources;
  }) => {
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  };

  if (error instanceof ZodError) {
    setError(handleZodError(error));
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    setError(handlePrismaValidationError(error));
  } else if (
    error.code === "P2000" ||
    error.code === "P2018" ||
    error.code === "P2003" ||
    error.code === "P2025"
  ) {
    setError(handlePrismaValidationError(error));
  } else if (error.code === "P2023") {
    setError(handlePrismaCastError(error));
  } else if (error.code === "P2002") {
    setError(handleDuplicateError(error));
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errorSources = [
      {
        path: req.originalUrl || "",
        message: error.message,
      },
    ];
  } else if (error instanceof Error) {
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
    stack: config.node_env === "development" ? error.stack : null,
  });
};

export default globalErrorHandler;