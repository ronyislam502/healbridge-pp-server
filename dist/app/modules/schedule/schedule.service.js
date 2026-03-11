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
exports.ScheduleServices = void 0;
const date_fns_1 = require("date-fns");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const healthQuery_1 = __importDefault(require("../../builder/healthQuery"));
const convertTime_1 = require("../../shared/convertTime");
const createScheduleIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const schedules = [];
    const intervalTime = 30;
    const currentDate = new Date(payload === null || payload === void 0 ? void 0 : payload.startDate);
    const endDate = new Date(payload === null || payload === void 0 ? void 0 : payload.endDate);
    while (currentDate <= endDate) {
        const startDateTime = new Date((0, date_fns_1.addMinutes)((0, date_fns_1.addHours)(`${(0, date_fns_1.format)(currentDate, "yyyy-MM-dd")}`, Number(payload === null || payload === void 0 ? void 0 : payload.startTime.split(":")[0])), Number(payload === null || payload === void 0 ? void 0 : payload.startTime.split(":")[1])));
        const endDateTime = new Date((0, date_fns_1.addMinutes)((0, date_fns_1.addHours)(`${(0, date_fns_1.format)(currentDate, "yyyy-MM-dd")}`, Number(payload === null || payload === void 0 ? void 0 : payload.endTime.split(":")[0])), Number(payload === null || payload === void 0 ? void 0 : payload.endTime.split(":")[1])));
        while (startDateTime < endDateTime) {
            // const scheduleData = {
            //   startDateTime: startDateTime,
            //   endDateTime: addMinutes(startDateTime, intervalTime),
            // };
            const s = yield (0, convertTime_1.convertDateTime)(startDateTime);
            const e = yield (0, convertTime_1.convertDateTime)((0, date_fns_1.addMinutes)(startDateTime, intervalTime));
            const scheduleData = {
                startDateTime: s,
                endDateTime: e,
            };
            const isScheduleExist = yield prisma_1.default.schedule.findFirst({
                where: {
                    startDateTime: scheduleData === null || scheduleData === void 0 ? void 0 : scheduleData.startDateTime,
                    endDateTime: scheduleData === null || scheduleData === void 0 ? void 0 : scheduleData.endDateTime,
                },
            });
            if (!isScheduleExist) {
                const result = yield prisma_1.default.schedule.create({
                    data: scheduleData,
                });
                schedules.push(result);
            }
            startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return schedules;
});
const getAllSchedulesFromDB = (user, query) => __awaiter(void 0, void 0, void 0, function* () {
    const isDoctorSchedule = yield prisma_1.default.doctorSchedules.findMany({
        where: {
            doctor: {
                email: user.email,
            },
        },
    });
    const doctorScheduleIds = isDoctorSchedule.map((schedule) => schedule.scheduleId);
    const updatedQuery = Object.assign(Object.assign({}, query), { excludeScheduleIds: doctorScheduleIds });
    const scheduleQuery = new healthQuery_1.default(prisma_1.default.schedule, updatedQuery)
        .filter()
        .sort()
        .paginate()
        .fields();
    const meta = yield scheduleQuery.countTotal();
    const data = yield scheduleQuery.execute();
    return { meta, data };
});
const getSingleScheduleFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.schedule.findUnique({
        where: {
            id,
        },
    });
    return result;
});
const deleteScheduleFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.schedule.delete({
        where: {
            id,
        },
    });
    return result;
});
exports.ScheduleServices = {
    createScheduleIntoDB,
    getAllSchedulesFromDB,
    getSingleScheduleFromDB,
    deleteScheduleFromDB,
};
