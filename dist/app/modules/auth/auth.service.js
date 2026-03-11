"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../shared/prisma"));
const http_status_1 = __importDefault(require("http-status"));
const jwtHelpers_1 = require("../../shared/jwtHelpers");
const bcryptHelpers_1 = require("../../shared/bcryptHelpers");
const sendEmail_1 = __importDefault(require("../../shared/sendEmail"));
const loginUserFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "This user not found !");
    }
    const isDeleted = user === null || user === void 0 ? void 0 : user.status;
    if (isDeleted === client_1.UserStatus.DELETED) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user is deleted !");
    }
    const isActive = user === null || user === void 0 ? void 0 : user.status;
    if (isActive === client_1.UserStatus.BLOCKED) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user is blocked ! !");
    }
    const isCorrectPassword = yield (0, bcryptHelpers_1.comparePasswords)(payload === null || payload === void 0 ? void 0 : payload.password, user === null || user === void 0 ? void 0 : user.password);
    if (!isCorrectPassword) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Password do not matched");
    }
    const jwtPayload = {
        email: user === null || user === void 0 ? void 0 : user.email,
        role: user === null || user === void 0 ? void 0 : user.role,
    };
    const accessToken = (0, jwtHelpers_1.createToken)(jwtPayload, config_1.default.jwt_access_Token_secrete, config_1.default.jwt_access_token_expire_in);
    const refreshToken = (0, jwtHelpers_1.createToken)(jwtPayload, config_1.default.jwt_refresh_token_secrete, config_1.default.jwt_refresh_token_expire_in);
    return {
        accessToken,
        refreshToken,
        needPasswordChange: user === null || user === void 0 ? void 0 : user.needPasswordChange,
    };
});
const refreshTokenFromDB = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = (0, jwtHelpers_1.verifyToken)(token, config_1.default.jwt_refresh_token_secrete);
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: decoded.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    if (user.passwordChangedAt &&
        decoded.iat &&
        user.passwordChangedAt.getTime() / 1000 > decoded.iat) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized !");
    }
    const jwtPayload = {
        email: user === null || user === void 0 ? void 0 : user.email,
        role: user === null || user === void 0 ? void 0 : user.role,
    };
    const accessToken = (0, jwtHelpers_1.createToken)(jwtPayload, config_1.default.jwt_access_Token_secrete, config_1.default.jwt_access_token_expire_in);
    return {
        accessToken,
        needPasswordChange: user === null || user === void 0 ? void 0 : user.needPasswordChange,
    };
});
const changePasswordIntoDB = (userData, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: userData === null || userData === void 0 ? void 0 : userData.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const isCorrectPassword = yield (0, bcryptHelpers_1.comparePasswords)(payload.oldPassword, user === null || user === void 0 ? void 0 : user.password);
    if (!isCorrectPassword) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Password do not matched");
    }
    const passwordHashed = yield (0, bcryptHelpers_1.hashPassword)(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    // console.log("has", passwordHashed);
    yield prisma_1.default.user.update({
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
});
const forgotPasswordFromDB = (userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: userEmail,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    // console.log("user", user);
    const jwtPayload = {
        email: user.email,
        role: user.role,
    };
    const resetPassToken = (0, jwtHelpers_1.createToken)(jwtPayload, config_1.default.jwt_access_Token_secrete, config_1.default.reset_pass_token_expire_in);
    const resetPassLink = `${config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.reset_pass_link}?email=${user === null || user === void 0 ? void 0 : user.email}&token=${resetPassToken} `;
    console.log("reset", resetPassLink);
    const emailHtml = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #1e40af;">Reset Your Password</h2>
      <p>Dear ${user === null || user === void 0 ? void 0 : user.name},</p>
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
    yield (0, sendEmail_1.default)(user.email, emailHtml);
});
const resetPasswordIntoDB = (payload, token) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const isTokenValid = (0, jwtHelpers_1.verifyToken)(token, config_1.default.reset_pass_token_secret);
    if (!isTokenValid) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
    }
    const passwordHashed = yield (0, bcryptHelpers_1.hashPassword)(payload === null || payload === void 0 ? void 0 : payload.newPassword, Number(config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.bcrypt_salt_rounds));
    yield prisma_1.default.user.update({
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
});
exports.AuthServices = {
    loginUserFromDB,
    refreshTokenFromDB,
    changePasswordIntoDB,
    forgotPasswordFromDB,
    resetPasswordIntoDB,
};
