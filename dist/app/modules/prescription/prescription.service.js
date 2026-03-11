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
exports.PrescriptionServices = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const healthQuery_1 = __importDefault(require("../../builder/healthQuery"));
const createPrescriptionIntoDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isAppointment = yield prisma_1.default.appointment.findUniqueOrThrow({
        where: {
            id: payload.appointmentId,
            status: client_1.AppointmentStatus.COMPLETED,
            paymentStatus: client_1.PaymentStatus.PAID,
        },
        include: {
            doctor: true,
        },
    });
    if (!(user.email === isAppointment.doctor.email)) {
        throw new AppError_1.default(httpStatus.BAD_REQUEST, "This is not your appointment");
    }
    const result = yield prisma_1.default.prescription.create({
        data: {
            appointmentId: isAppointment.id,
            doctorId: isAppointment.doctor.id,
            patientId: isAppointment.patientId,
            introduction: payload.introduction,
            followUpDate: payload.followUpDate,
        },
        include: {
            patient: true,
        },
    });
    return result;
});
const getAllPrescriptionsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const prescriptionQuery = new healthQuery_1.default(prisma_1.default.prescription, query)
        .filter()
        .sort()
        .paginate()
        .fields()
        .setInclude({
        doctor: true,
        patient: true,
        appointment: true,
    });
    const meta = yield prescriptionQuery.countTotal();
    const data = yield prescriptionQuery.execute();
    return { meta, data };
});
const getPatientPrescriptionsFromDB = (user, query) => __awaiter(void 0, void 0, void 0, function* () {
    const isPatient = yield prisma_1.default.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });
    query.id = isPatient.id;
    const prescriptionQuery = new healthQuery_1.default(prisma_1.default.prescription, query)
        .filter()
        .sort()
        .paginate()
        .fields()
        .setInclude({
        doctor: true,
        appointment: true,
    });
    const meta = yield prescriptionQuery.countTotal();
    const data = yield prescriptionQuery.execute();
    return { meta, data };
});
exports.PrescriptionServices = {
    createPrescriptionIntoDB,
    getAllPrescriptionsFromDB,
    getPatientPrescriptionsFromDB,
};
