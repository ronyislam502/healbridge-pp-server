import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";

const notFound = (req: Request, res: Response, next: NextFunction): void => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND !!",
    error: {
      path: req.originalUrl,
      message: "Please provide right api",
    },
  });
};

export default notFound;
