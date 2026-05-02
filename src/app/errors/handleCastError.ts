import { TErrorSources, TGenericErrorResponse } from "../interface/error";
import httpStatus from "http-status";

const handlePrismaCastError = (error: any): TGenericErrorResponse => {
  // Handle only Prisma cast error (P2023)
  const errorSources: TErrorSources = [
    {
      path: error.meta?.field_name || "",
      message: error.message || "Invalid value or type for field",
    },
  ];

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: "Invalid Error",
    errorSources,
  };
};

export default handlePrismaCastError;
