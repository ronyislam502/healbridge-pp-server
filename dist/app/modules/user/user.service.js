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
exports.UserServices = void 0;
const bcryptHelpers_1 = require("../../shared/bcryptHelpers");
const config_1 = __importDefault(require("../../config"));
const user_interface_1 = require("./user.interface");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const client_1 = require("@prisma/client");
const healthQuery_1 = __importDefault(require("../../builder/healthQuery"));
const CreateAdminIntoDB = (image, password, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (image && image.path) {
        payload.avatar = image.path;
    }
    const hashedPassword = yield (0, bcryptHelpers_1.hashPassword)(password, Number(config_1.default.bcrypt_salt_rounds));
    // console.log("pass", hashedPassword)
    const userData = {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        role: client_1.UserRole === null || client_1.UserRole === void 0 ? void 0 : client_1.UserRole.ADMIN,
    };
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transactionClient.user.create({
            data: userData,
        });
        const createAdmin = yield transactionClient.admin.create({
            data: payload,
        });
        return createAdmin;
    }));
    return result;
});
const CreateDoctorIntoDB = (image, password, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("doctor", payload);
    // console.log("image", image);
    const file = image;
    if (file) {
        payload.avatar = file.path;
    }
    const hashedPassword = yield (0, bcryptHelpers_1.hashPassword)(password, Number(config_1.default.bcrypt_salt_rounds));
    // console.log("pass", hashedPassword)
    const userData = {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        role: client_1.UserRole === null || client_1.UserRole === void 0 ? void 0 : client_1.UserRole.DOCTOR,
    };
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transactionClient.user.create({
            data: userData,
        });
        const createDoctor = yield transactionClient.doctor.create({
            data: payload,
        });
        return createDoctor;
    }));
    return result;
});
const CreatePatientIntoDB = (image, password, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const file = image;
    if (file) {
        payload.avatar = image.path;
    }
    const hashedPassword = yield (0, bcryptHelpers_1.hashPassword)(password, Number(config_1.default.bcrypt_salt_rounds));
    // console.log("pass", hashedPassword)
    const userData = {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        role: client_1.UserRole === null || client_1.UserRole === void 0 ? void 0 : client_1.UserRole.PATIENT,
    };
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transactionClient.user.create({
            data: userData,
        });
        const createPatient = yield transactionClient.patient.create({
            data: payload,
        });
        return createPatient;
    }));
    return result;
});
const getAllUsersFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new healthQuery_1.default(prisma_1.default.user, query)
        .search(user_interface_1.userSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields()
        .setSelect({
        id: true,
        email: true,
        name: true,
        role: true,
        needPasswordChange: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        admin: true,
        doctor: true,
        patient: true,
    });
    const users = yield queryBuilder.execute();
    const meta = yield queryBuilder.countTotal();
    return { meta, data: users };
});
const getSingleUserFromDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isUser = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email,
            status: client_1.UserStatus.ACTIVE,
        },
        select: {
            id: true,
            email: true,
            needPasswordChange: true,
            role: true,
            status: true,
        },
    });
    let profileInfo;
    if (isUser.role === client_1.UserRole.SUPER_ADMIN) {
        profileInfo = yield prisma_1.default.admin.findUnique({
            where: {
                email: isUser.email,
            },
        });
    }
    else if (isUser.role === client_1.UserRole.ADMIN) {
        profileInfo = yield prisma_1.default.admin.findUnique({
            where: {
                email: isUser.email,
            },
        });
    }
    else if (isUser.role === client_1.UserRole.DOCTOR) {
        profileInfo = yield prisma_1.default.doctor.findUnique({
            where: {
                email: isUser.email,
            },
        });
    }
    else if (isUser.role === client_1.UserRole.PATIENT) {
        profileInfo = yield prisma_1.default.patient.findUnique({
            where: {
                email: isUser.email,
            },
        });
    }
    return Object.assign(Object.assign({}, isUser), profileInfo);
});
const changeProfileStatusFromDB = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id,
        },
    });
    const updateStatus = yield prisma_1.default.user.update({
        where: {
            id: user === null || user === void 0 ? void 0 : user.id,
        },
        data: status,
    });
    return updateStatus;
});
const getMyProfileFromDB = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const userInfo = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: userData.email,
            status: client_1.UserStatus.ACTIVE,
        },
        select: {
            id: true,
            email: true,
            needPasswordChange: true,
            role: true,
            status: true,
        },
    });
    let profileInfo;
    if (userInfo.role === client_1.UserRole.SUPER_ADMIN) {
        profileInfo = yield prisma_1.default.admin.findUnique({
            where: {
                email: userInfo.email,
            },
        });
    }
    else if (userInfo.role === client_1.UserRole.ADMIN) {
        profileInfo = yield prisma_1.default.admin.findUnique({
            where: {
                email: userInfo.email,
            },
        });
    }
    else if (userInfo.role === client_1.UserRole.DOCTOR) {
        profileInfo = yield prisma_1.default.doctor.findUnique({
            where: {
                email: userInfo.email,
            },
        });
    }
    else if (userInfo.role === client_1.UserRole.PATIENT) {
        profileInfo = yield prisma_1.default.patient.findUnique({
            where: {
                email: userInfo.email,
            },
        });
    }
    return Object.assign(Object.assign({}, userInfo), profileInfo);
});
const updateMyProfileIntoDB = (userData, image, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUser = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: userData.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const file = image;
    if (file) {
        payload.avatar = file.path;
    }
    let profileInfo;
    if (isUser.role === client_1.UserRole.SUPER_ADMIN) {
        profileInfo = yield prisma_1.default.admin.update({
            where: {
                email: isUser.email,
            },
            data: payload,
        });
    }
    else if (isUser.role === client_1.UserRole.ADMIN) {
        profileInfo = yield prisma_1.default.admin.update({
            where: {
                email: isUser.email,
            },
            data: payload,
        });
    }
    else if (isUser.role === client_1.UserRole.DOCTOR) {
        profileInfo = yield prisma_1.default.doctor.update({
            where: {
                email: isUser.email,
            },
            data: payload,
        });
    }
    else if (isUser.role === client_1.UserRole.PATIENT) {
        profileInfo = yield prisma_1.default.patient.update({
            where: {
                email: isUser.email,
            },
            data: payload,
        });
    }
    return Object.assign({}, profileInfo);
});
exports.UserServices = {
    CreateAdminIntoDB,
    CreateDoctorIntoDB,
    CreatePatientIntoDB,
    getAllUsersFromDB,
    getSingleUserFromDB,
    changeProfileStatusFromDB,
    getMyProfileFromDB,
    updateMyProfileIntoDB,
};
