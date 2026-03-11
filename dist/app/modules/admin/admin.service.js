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
exports.AdminServices = void 0;
const prisma_1 = __importDefault(require("../../shared/prisma"));
const admin_interface_1 = require("./admin.interface");
const client_1 = require("@prisma/client");
const healthQuery_1 = __importDefault(require("../../builder/healthQuery"));
const getAllAdminsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new healthQuery_1.default(prisma_1.default.admin, query)
        .search(admin_interface_1.adminSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const admins = yield queryBuilder.execute();
    const meta = yield queryBuilder.countTotal();
    return { meta, data: admins };
});
const getSingleAdminFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.admin.findUnique({
        where: {
            id,
            isDeleted: false,
        },
    });
    return result;
});
const updateAdminIntoDB = (id, image, payload) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    const file = image;
    if (file) {
        payload.avatar = file.path;
    }
    const updatedAdmin = yield prisma_1.default.admin.update({
        where: {
            id,
        },
        data: payload,
    });
    return updatedAdmin;
});
// permanent delete or vanish data
// const deleteAdminFromDB = async (id: string): Promise<Admin | null> => {
//   await prisma.admin.findUniqueOrThrow({
//     where: {
//       id,
//     },
//   });
//   const result = await prisma.$transaction(async (transactionClient) => {
//     const adminDelete = await transactionClient.admin.delete({
//       where: {
//         id,
//       },
//     });
//     await transactionClient.user.delete({
//       where: {
//         email: adminDelete?.email,
//       },
//     });
//     return adminDelete;
//   });
//   return result;
// };
const deleteAdminFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const adminDelete = yield transactionClient.admin.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
            },
        });
        yield transactionClient.user.update({
            where: {
                email: adminDelete === null || adminDelete === void 0 ? void 0 : adminDelete.email,
            },
            data: {
                status: client_1.UserStatus.DELETED,
            },
        });
        return adminDelete;
    }));
    return result;
});
exports.AdminServices = {
    getAllAdminsFromDB,
    getSingleAdminFromDB,
    updateAdminIntoDB,
    deleteAdminFromDB,
};
