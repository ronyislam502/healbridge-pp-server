/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSources, TGenericErrorResponse } from "../interface/error";
import httpStatus from "http-status";

const handleDuplicateError = (error: any): TGenericErrorResponse => {
  const statusCode = httpStatus.BAD_REQUEST;

  // Check if Prisma duplicate error (P2002)
  if (error.code === "P2002") {
    const fieldName = error.meta?.target?.[0] ?? "field";

    const errorSources: TErrorSources = [
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
  const errorSources: TErrorSources = [
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

export default handleDuplicateError;
