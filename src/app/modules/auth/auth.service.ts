import { UserStatus } from "@prisma/client";
import config from "../../config";
import AppError from "../../errors/AppError";
import prisma from "../../shared/prisma";
import { TLoginUser } from "./auth.interface";
import httpStatus from "http-status";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { createToken, verifyToken } from "../../shared/jwtHelpers";
import { comparePasswords, hashPassword } from "../../shared/bcryptHelpers";
import sendEmail from "../../shared/sendEmail";

const loginUserFromDB = async (payload: TLoginUser) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user not found !");
  }

  const isDeleted = user?.status;

  if (isDeleted === UserStatus.DELETED) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
  }

  const isActive = user?.status;

  if (isActive === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked ! !");
  }

  const isCorrectPassword = await comparePasswords(
    payload?.password,
    user?.password as string
  );

  if (!isCorrectPassword) {
    throw new AppError(httpStatus.FORBIDDEN, "Password do not matched");
  }

  const jwtPayload = {
    email: user?.email as string,
    role: user?.role as string,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_Token_secrete as string,
    config.jwt_access_token_expire_in as SignOptions["expiresIn"]
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_token_secrete as string,
    config.jwt_refresh_token_expire_in as SignOptions["expiresIn"]
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user?.needPasswordChange,
  };
};

const refreshTokenFromDB = async (token: string) => {
  const decoded = verifyToken(
    token,
    config.jwt_refresh_token_secrete as string
  );

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: decoded.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (
    user.passwordChangedAt &&
    decoded.iat &&
    user.passwordChangedAt.getTime() / 1000 > decoded.iat
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized !");
  }

  const jwtPayload = {
    email: user?.email as string,
    role: user?.role as string,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_Token_secrete as string,
    config.jwt_access_token_expire_in as SignOptions["expiresIn"]
  );

  return {
    accessToken,
    needPasswordChange: user?.needPasswordChange,
  };
};

const changePasswordIntoDB = async (
  userData: JwtPayload,
  payload: {
    oldPassword: string;
    newPassword: string;
  }
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: userData?.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword = await comparePasswords(
    payload.oldPassword,
    user?.password as string
  );

  if (!isCorrectPassword) {
    throw new AppError(httpStatus.FORBIDDEN, "Password do not matched");
  }
  const passwordHashed = await hashPassword(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  // console.log("has", passwordHashed);

  await prisma.user.update({
    where: {
      email: user.email,
      role: user.role,
    },
    data: {
      password: passwordHashed,
      needPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  });
  return {
    message: "Password changed successfully!",
  };
};

const forgotPasswordFromDB = async (userEmail: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: userEmail,
      status: UserStatus.ACTIVE,
    },
  });

  // console.log("user", user);

  const jwtPayload = {
    email: user.email,
    role: user.role,
  };

  const resetPassToken = createToken(
    jwtPayload,
    config.jwt_access_Token_secrete as string,
    config.reset_pass_token_expire_in as SignOptions["expiresIn"]
  );

  const resetPassLink = `${config?.reset_pass_link}?email=${user?.email}&token=${resetPassToken} `;

  console.log("reset", resetPassLink);

  const emailHtml = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #1e40af;">Reset Your Password</h2>
      <p>Dear ${user?.name},</p>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <p style="text-align: center;">
        <a href="${resetPassLink}" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Reset Password
        </a>
      </p>
      <p>If you didn’t request this, you can safely ignore this email.</p>
      <p>Thanks,<br/>The Support Team</p>
    </div>
  </div>
`;

  await sendEmail(user.email, emailHtml);
};

const resetPasswordIntoDB = async (
  payload: { email: string; newPassword: string },
  token: string
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isTokenValid = verifyToken(
    token,
    config.reset_pass_token_secret as string
  );

  if (!isTokenValid) {
    throw new AppError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  const passwordHashed = await hashPassword(
    payload?.newPassword,
    Number(config?.bcrypt_salt_rounds)
  );

  await prisma.user.update({
    where: {
      email: user.email,
      role: user.role,
    },
    data: {
      password: passwordHashed,
      needPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  });
};

export const AuthServices = {
  loginUserFromDB,
  refreshTokenFromDB,
  changePasswordIntoDB,
  forgotPasswordFromDB,
  resetPasswordIntoDB,
};
