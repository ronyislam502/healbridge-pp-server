import { UserRole, UserStatus } from "@prisma/client";
import catchAsync from "../shared/catchAsync";
import AppError from "../errors/AppError";
import httpStatus from "http-status";
import { verifyToken } from "../shared/jwtHelpers";
import config from "../config";
import prisma from "../shared/prisma";
import { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are unauthorized");
    }

    const decoded = verifyToken(
      token,
      config.jwt_access_Token_secrete as string
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: {
        email: decoded.email,
      },
    });

    // console.log("user", user);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
    }
    const isDeleted = user?.status;

    if (isDeleted === UserStatus.DELETED) {
      throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
    }

    const isActive = user?.status;

    if (isActive === UserStatus.BLOCKED) {
      throw new AppError(httpStatus.FORBIDDEN, "This user is blocked !!");
    }

    if (
      user.passwordChangedAt &&
      decoded.iat &&
      user.passwordChangedAt.getTime() / 1000 > decoded.iat
    ) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are unauthorized !");
    }

    if (requiredRoles && !requiredRoles.includes(decoded?.role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are unauthorized!");
    }

    req.user = decoded as JwtPayload & { role: string };
    // console.log("auth", req.user);
    next();
  });
};

export default auth;
