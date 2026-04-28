import { ZodError, ZodIssue } from "zod";
import { TErrorSources, TGenericErrorResponse } from "../interface/error";
import httpStatus from "http-status";

const handleZodError = (error: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSources = error.issues.map((issue: ZodIssue) => {
    return {
      // path: issue?.path[issue.path.length - 1],
      path: issue?.path.join("."),
      message: issue?.message,
    };
  });

  const statusCode = httpStatus.BAD_REQUEST;

  return {
    statusCode,
    message: "Validation error",
    errorSources,
  };
};

export default handleZodError;
