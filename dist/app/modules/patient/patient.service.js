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
exports.PatientServices = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const patient_interface_1 = require("./patient.interface");
const healthQuery_1 = __importDefault(require("../../builder/healthQuery"));
const getAllPatientsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const patientQuery = new healthQuery_1.default(prisma_1.default.patient, query)
        .search(patient_interface_1.patientSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate()
        .setInclude({
        patientHealthData: true,
        medicalReport: true,
    });
    const meta = yield patientQuery.countTotal();
    const data = yield patientQuery.execute();
    return { meta, data };
});
const getSinglePatientFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.patient.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            patientHealthData: true,
            medicalReport: true,
        },
    });
    return result;
});
const deletePatientFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.patient.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const patientDelete = yield transactionClient.patient.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
            },
        });
        yield transactionClient.user.update({
            where: {
                email: patientDelete === null || patientDelete === void 0 ? void 0 : patientDelete.email,
            },
            data: {
                status: client_1.UserStatus.DELETED,
            },
        });
        return patientDelete;
    }));
    return result;
});
const updatePatientIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { patientHealthData, medicalReport } = payload, patientData = __rest(payload, ["patientHealthData", "medicalReport"]);
    const isPatient = yield prisma_1.default.patient.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield transactionClient.patient.update({
            where: {
                id: isPatient.id,
            },
            data: patientData,
            include: {
                patientHealthData: true,
                medicalReport: true,
            },
        });
        if (patientHealthData) {
            yield transactionClient.patientHealthData.upsert({
                where: {
                    patientId: isPatient.id,
                },
                update: patientHealthData,
                create: Object.assign(Object.assign({}, patientHealthData), { patientId: isPatient.id }),
            });
        }
        if (medicalReport) {
            yield transactionClient.medicalReport.create({
                data: Object.assign(Object.assign({}, medicalReport), { patientId: isPatient.id }),
            });
        }
    }));
    // console.log("phd", patientHealthData, medicalReport);
    const result = yield prisma_1.default.patient.findUnique({
        where: {
            id: isPatient.id,
        },
        include: {
            patientHealthData: true,
            medicalReport: true,
        },
    });
    return result;
});
exports.PatientServices = {
    getAllPatientsFromDB,
    getSinglePatientFromDB,
    deletePatientFromDB,
    updatePatientIntoDB,
};
