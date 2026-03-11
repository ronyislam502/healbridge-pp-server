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
exports.ReviewServices = void 0;
const prisma_1 = __importDefault(require("../../shared/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const healthQuery_1 = __importDefault(require("../../builder/healthQuery"));
const createReviewIntoDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isAppointment = yield prisma_1.default.appointment.findUniqueOrThrow({
        where: {
            id: payload.appointmentId,
        },
        include: {
            patient: true,
        },
    });
    if (user.email !== isAppointment.patient.email) {
        throw new AppError_1.default(httpStatus.BAD_REQUEST, "this appointment is not your appointment");
    }
    const result = yield prisma_1.default.review.create({
        data: {
            appointmentId: payload.appointmentId,
            doctorId: payload.doctorId,
            patientId: payload.patientId,
            rating: payload.rating,
            comment: payload.comment,
        },
    });
    return result;
});
const getAllReviewsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewQuery = new healthQuery_1.default(prisma_1.default.review, query)
        .filter()
        .sort()
        .paginate()
        .fields()
        .setInclude({
        doctor: true,
        patient: true,
    });
    const meta = yield reviewQuery.countTotal();
    const data = yield reviewQuery.execute();
    const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = data.length > 0 ? (totalRating / data.length).toFixed(2) : "0.00";
    return { meta, data, totalRating, averageRating };
});
exports.ReviewServices = {
    createReviewIntoDB,
    getAllReviewsFromDB,
};
