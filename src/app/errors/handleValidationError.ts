import { Prisma } from "@prisma/client";
import { TErrorSources, TGenericErrorResponse } from "../interface/error";

const handlePrismaValidationError = (error: any): TGenericErrorResponse => {
  let errorSources: TErrorSources = [];

  // Handle known Prisma error codes
  if (
    error.code === "P2000" ||
    error.code === "P2018" ||
    error.code === "P2003" ||
    error.code === "P2023" ||
    error.code === "P2025"
  ) {
    const field =
      error.meta?.field_name ||
      error.meta?.constraint_name ||
      error.meta?.target?.[0] ||
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
  if (error instanceof Prisma.PrismaClientValidationError) {
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
    errorSources = Object.values(error.errors).map((val: any) => ({
      path: val.path || "",
      message: val.message || "Validation error",
    }));
  } else {
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

export default handlePrismaValidationError;
