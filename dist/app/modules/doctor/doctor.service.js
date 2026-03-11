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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorServices = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const doctor_interface_1 = require("./doctor.interface");
const healthQuery_1 = __importDefault(require("../../builder/healthQuery"));
const getAllDoctorsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const doctorQuery = new healthQuery_1.default(prisma_1.default.doctor, query)
        .search(doctor_interface_1.doctorSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields()
        .setInclude({
        doctorSpecialties: {
            include: {
                specialties: true,
            },
        },
    });
    const meta = yield doctorQuery.countTotal();
    const data = yield doctorQuery.execute();
    return { meta, data };
});
const getSingleDoctorFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true,
                },
            },
        },
    });
    return result;
});
const deleteDoctorFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const doctorDelete = yield transactionClient.doctor.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
            },
        });
        yield transactionClient.user.update({
            where: {
                email: doctorDelete === null || doctorDelete === void 0 ? void 0 : doctorDelete.email,
            },
            data: {
                status: client_1.UserStatus.DELETED,
            },
        });
        return doctorDelete;
    }));
    return result;
});
const updateDoctorFromDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("uu", payload);
    const { specialties } = payload, doctorData = __rest(payload, ["specialties"]);
    const isDoctor = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma_1.default.doctor.update({
            where: {
                id,
            },
            data: doctorData,
            include: {
                doctorSpecialties: true,
            },
        });
        if (specialties && specialties.length > 0) {
            // delete specialties
            const deleteDoctorSpecialties = specialties.filter((specialty) => specialty.isDeleted);
            // console.log("dele", deleteSpecialtiesIds);
            for (const specialty of deleteDoctorSpecialties) {
                yield transactionClient.doctorSpecialties.deleteMany({
                    where: {
                        doctorId: isDoctor === null || isDoctor === void 0 ? void 0 : isDoctor.id,
                        specialtiesId: specialty.specialtiesId,
                    },
                });
            }
            // create specialties
            const createDoctorSpecialties = specialties.filter((specialty) => !specialty.isDeleted);
            // console.log("cre", createDoctorSpecialties);
            for (const specialty of createDoctorSpecialties) {
                yield transactionClient.doctorSpecialties.create({
                    data: {
                        doctorId: isDoctor === null || isDoctor === void 0 ? void 0 : isDoctor.id,
                        specialtiesId: specialty.specialtiesId,
                    },
                });
            }
        }
    }));
    const result = yield prisma_1.default.doctor.findUnique({
        where: {
            id: isDoctor.id,
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true,
                },
            },
        },
    });
    return result;
});
exports.DoctorServices = {
    getAllDoctorsFromDB,
    getSingleDoctorFromDB,
    deleteDoctorFromDB,
    updateDoctorFromDB,
};
