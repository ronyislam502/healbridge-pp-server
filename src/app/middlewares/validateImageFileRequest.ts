import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import catchAsync from "../shared/catchAsync";

const validateImageFileRequest = (
  schema: ZodType<any>
) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsedFile = await schema.parseAsync({
      files: req.files,
    });

    req.files = parsedFile.files;

    next();
  });
};

export default validateImageFileRequest;
