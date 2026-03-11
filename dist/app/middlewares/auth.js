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
const client_1 = require("@prisma/client");
const catchAsync_1 = __importDefault(require("../shared/catchAsync"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const jwtHelpers_1 = require("../shared/jwtHelpers");
const config_1 = __importDefault(require("../config"));
const prisma_1 = __importDefault(require("../shared/prisma"));
const auth = (...requiredRoles) => {
    return (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.headers.authorization;
        if (!token) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You are unauthorized");
        }
        const decoded = (0, jwtHelpers_1.verifyToken)(token, config_1.default.jwt_access_Token_secrete);
        const user = yield prisma_1.default.user.findUnique({
            where: {
                email: decoded.email,
            },
        });
        // console.log("user", user);
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "This user is not found !");
        }
        const isDeleted = user === null || user === void 0 ? void 0 : user.status;
        if (isDeleted === client_1.UserStatus.DELETED) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user is deleted !");
        }
        const isActive = user === null || user === void 0 ? void 0 : user.status;
        if (isActive === client_1.UserStatus.BLOCKED) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user is blocked !!");
        }
        if (user.passwordChangedAt &&
            decoded.iat &&
            user.passwordChangedAt.getTime() / 1000 > decoded.iat) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You are unauthorized !");
        }
        if (requiredRoles && !requiredRoles.includes(decoded === null || decoded === void 0 ? void 0 : decoded.role)) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You are unauthorized!");
        }
        req.user = decoded;
        // console.log("auth", req.user);
        next();
    }));
};
exports.default = auth;
