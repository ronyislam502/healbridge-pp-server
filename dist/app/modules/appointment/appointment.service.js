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
exports.AppointmentServices = void 0;
const prisma_1 = __importDefault(require("../../shared/prisma"));
const uuid_1 = require("uuid");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const client_1 = require("@prisma/client");
const healthQuery_1 = __importDefault(require("../../builder/healthQuery"));
const createAppointmentIntoDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isPatient = yield prisma_1.default.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });
    const isDoctor = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
        },
    });
    const isSchedule = yield prisma_1.default.doctorSchedules.findFirst({
        where: {
            doctorId: isDoctor.id,
            scheduleId: payload.scheduleId,
            isBooked: false,
        },
    });
    if (!isSchedule) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "This schedule not found");
    }
    const videoCallingId = (0, uuid_1.v4)();
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const appointmentData = yield transactionClient.appointment.create({
            data: {
                patientId: isPatient.id,
                doctorId: isDoctor.id,
                scheduleId: payload.scheduleId,
                videoCallingId,
            },
            include: {
                patient: true,
                doctor: true,
                schedule: true,
            },
        });
        yield transactionClient.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: isDoctor.id,
                    scheduleId: payload.scheduleId,
                },
            },
            data: {
                isBooked: true,
                appointmentId: appointmentData.id,
            },
        });
        const today = new Date();
        console.log("to", today);
        const transactionId = "HC" +
            today.getFullYear() +
            +today.getMonth() +
            +today.getDay() +
            +today.getHours() +
            +today.getMinutes() +
            +today.getSeconds();
        console.log("trans_id", transactionId);
        yield transactionClient.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: isDoctor.appointmentFee,
                transactionId,
            },
        });
        return appointmentData;
    }));
    return result;
});
const getMyAppointmentsFromDB = (user, query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let profileInfo;
    if (user.role === client_1.UserRole.DOCTOR) {
        profileInfo = yield prisma_1.default.doctor.findUnique({
            where: {
                email: user.email,
            },
        });
        if (profileInfo === null || profileInfo === void 0 ? void 0 : profileInfo.id) {
            query.doctorId = profileInfo.id;
        }
    }
    else if (user.role === client_1.UserRole.PATIENT) {
        profileInfo = yield prisma_1.default.patient.findUnique({
            where: {
                email: user.email,
            },
        });
        if (profileInfo === null || profileInfo === void 0 ? void 0 : profileInfo.id) {
            query.patientId = profileInfo.id;
        }
    }
    const appointmentQuery = new healthQuery_1.default(prisma_1.default.appointment, query)
        .filter()
        .sort()
        .paginate()
        .fields()
        .setInclude((user === null || user === void 0 ? void 0 : user.role) === client_1.UserRole.PATIENT
        ? { doctor: true, schedule: true }
        : {
            patient: {
                include: { medicalReport: true, patientHealthData: true },
            },
            schedule: true,
        });
    const meta = yield appointmentQuery.countTotal();
    const data = yield appointmentQuery.execute();
    console.log((_a = data === null || data === void 0 ? void 0 : data.patient) === null || _a === void 0 ? void 0 : _a.email);
    return { meta, data };
});
const getAllAppointmentsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const appointmentsQuery = new healthQuery_1.default(prisma_1.default.appointment, query)
        .filter()
        .sort()
        .paginate()
        .fields()
        .setInclude({
        doctor: true,
        patient: true,
        schedule: true,
        payment: true,
    });
    const meta = yield appointmentsQuery.countTotal();
    const data = yield appointmentsQuery.execute();
    return { meta, data };
});
const changeAppointmentStatusIntoDB = (user, appointmentId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const isAppointment = yield prisma_1.default.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId,
        },
        include: {
            doctor: true,
        },
    });
    if (user.role === client_1.UserRole.DOCTOR) {
        if (!(user.email === isAppointment.doctor.email)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "this is not your appointment");
        }
    }
    const result = yield prisma_1.default.appointment.update({
        where: {
            id: isAppointment.id,
        },
        data: {
            status,
        },
    });
    return result;
});
const cancelUnPaidAppointments = () => __awaiter(void 0, void 0, void 0, function* () {
    const thirtyMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const unPaidAppointments = yield prisma_1.default.appointment.findMany({
        where: {
            createdAt: {
                lte: thirtyMinAgo,
            },
            paymentStatus: client_1.PaymentStatus.UNPAID,
        },
    });
    const appointmentIdsToCancel = unPaidAppointments.map((appointment) => appointment.id);
    yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.payment.deleteMany({
            where: {
                appointmentId: {
                    in: appointmentIdsToCancel,
                },
            },
        });
        for (const unPaidAppointment of unPaidAppointments) {
            yield tx.doctorSchedules.updateMany({
                where: {
                    doctorId: unPaidAppointment.doctorId,
                    scheduleId: unPaidAppointment.scheduleId,
                },
                data: {
                    isBooked: false,
                },
            });
        }
    }));
});
exports.AppointmentServices = {
    createAppointmentIntoDB,
    getMyAppointmentsFromDB,
    getAllAppointmentsFromDB,
    changeAppointmentStatusIntoDB,
    cancelUnPaidAppointments,
};
