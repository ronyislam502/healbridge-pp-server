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
exports.DoctorScheduleServices = void 0;
const prisma_1 = __importDefault(require("../../shared/prisma"));
const healthQuery_1 = __importDefault(require("../../builder/healthQuery"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const createDoctorScheduleIntoDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isDoctor = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });
    const schedule = payload.scheduleIds.map((scheduleId) => ({
        doctorId: isDoctor.id,
        scheduleId,
    }));
    const result = yield prisma_1.default.doctorSchedules.createMany({
        data: schedule,
    });
    return result;
});
const getAllDoctorScheduleFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const doctorScheduleQuery = new healthQuery_1.default(prisma_1.default.doctorSchedules, query)
        .filter()
        .sort()
        .paginate()
        .fields()
        .setInclude({
        doctor: true,
        schedule: true,
    });
    const meta = yield doctorScheduleQuery.countTotal();
    const data = yield doctorScheduleQuery.execute();
    return { meta, data };
});
const getMyScheduleFromDB = (user, query) => __awaiter(void 0, void 0, void 0, function* () {
    const isDoctor = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });
    query.doctorId = isDoctor.id;
    const doctorScheduleQuery = new healthQuery_1.default(prisma_1.default.doctorSchedules, query)
        .filter()
        .sort()
        .paginate()
        .fields()
        .setInclude({
        schedule: true,
        doctor: true,
    });
    const meta = yield doctorScheduleQuery.countTotal();
    const data = yield doctorScheduleQuery.execute();
    return { meta, data };
});
const deleteDoctorScheduleFromDB = (user, id) => __awaiter(void 0, void 0, void 0, function* () {
    const isDoctor = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });
    const isBookedSchedule = yield prisma_1.default.doctorSchedules.findFirst({
        where: {
            doctorId: isDoctor.id,
            scheduleId: id,
            isBooked: true,
        },
    });
    if (isBookedSchedule) {
        throw new AppError_1.default(httpStatus.FORBIDDEN, "You can not delete this schedule cause schedule already booked!");
    }
    const result = yield prisma_1.default.doctorSchedules.delete({
        where: {
            doctorId_scheduleId: {
                doctorId: isDoctor.id,
                scheduleId: id,
            },
        },
    });
    return result;
});
exports.DoctorScheduleServices = {
    createDoctorScheduleIntoDB,
    getMyScheduleFromDB,
    deleteDoctorScheduleFromDB,
    getAllDoctorScheduleFromDB,
};
