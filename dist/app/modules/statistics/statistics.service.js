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
exports.StatisticsServices = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const statisticsDashboardDataFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    let metaData;
    switch (user === null || user === void 0 ? void 0 : user.role) {
        case client_1.UserRole.SUPER_ADMIN:
            metaData = getSuperAdminData();
            break;
        case client_1.UserRole.ADMIN:
            metaData = getAdminData();
            break;
        case client_1.UserRole.DOCTOR:
            metaData = getDoctorData(user);
            break;
        case client_1.UserRole.PATIENT:
            metaData = getPatientData(user);
    }
    return metaData;
});
const getSuperAdminData = () => __awaiter(void 0, void 0, void 0, function* () {
    const appointmentCount = yield prisma_1.default.appointment.count();
    const patientCount = yield prisma_1.default.patient.count();
    const doctorCount = yield prisma_1.default.doctor.count();
    const adminCount = yield prisma_1.default.admin.count();
    const paymentCount = yield prisma_1.default.payment.count();
    const totalRevenue = yield prisma_1.default.payment.aggregate({
        _sum: { amount: true },
        where: {
            status: client_1.PaymentStatus.PAID,
        },
    });
    const barChartData = yield getBarChartData();
    const pieCharData = yield getPieChartData();
    return {
        appointmentCount,
        patientCount,
        doctorCount,
        adminCount,
        paymentCount,
        totalRevenue,
        barChartData,
        pieCharData,
    };
});
const getAdminData = () => __awaiter(void 0, void 0, void 0, function* () {
    const appointmentCount = yield prisma_1.default.appointment.count();
    const patientCount = yield prisma_1.default.patient.count();
    const doctorCount = yield prisma_1.default.doctor.count();
    const paymentCount = yield prisma_1.default.payment.count();
    const totalRevenue = yield prisma_1.default.payment.aggregate({
        _sum: { amount: true },
        where: {
            status: client_1.PaymentStatus.PAID,
        },
    });
    const barChartData = yield getBarChartData();
    const pieCharData = yield getPieChartData();
    return {
        appointmentCount,
        patientCount,
        doctorCount,
        paymentCount,
        totalRevenue,
        barChartData,
        pieCharData,
    };
});
const getDoctorData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const isDoctor = yield prisma_1.default.doctor.findUniqueOrThrow({
        where: {
            email: user === null || user === void 0 ? void 0 : user.email,
        },
    });
    const appointmentCount = yield prisma_1.default.appointment.count({
        where: {
            doctorId: isDoctor.id,
        },
    });
    const patientCount = yield prisma_1.default.appointment.groupBy({
        by: ["patientId"],
        _count: {
            id: true,
        },
    });
    const reviewCount = yield prisma_1.default.review.count({
        where: {
            doctorId: isDoctor.id,
        },
    });
    const totalRevenue = yield prisma_1.default.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            appointment: {
                doctorId: isDoctor.id,
            },
            status: client_1.PaymentStatus.PAID,
        },
    });
    const appointmentStatusDistribution = yield prisma_1.default.appointment.groupBy({
        by: ["status"],
        _count: { id: true },
        where: {
            doctorId: isDoctor.id,
        },
    });
    const formattedAppointmentStatus = appointmentStatusDistribution.map(({ status, _count }) => ({ status, count: Number(_count.id) }));
    return {
        appointmentCount,
        reviewCount,
        patientCount: patientCount.length,
        totalRevenue,
        formattedAppointmentStatus,
    };
});
const getPatientData = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const isPatient = yield prisma_1.default.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });
    const appointmentCount = yield prisma_1.default.appointment.count({
        where: {
            patientId: isPatient.id,
        },
    });
    const prescriptionCount = yield prisma_1.default.prescription.count({
        where: {
            patientId: isPatient.id,
        },
    });
    const reviewCount = yield prisma_1.default.review.count({
        where: {
            patientId: isPatient.id,
        },
    });
    const appointmentStatusDistribution = yield prisma_1.default.appointment.groupBy({
        by: ["status"],
        _count: {
            id: true,
        },
        where: {
            patientId: isPatient.id,
        },
    });
    const formattedAppointmentStatus = appointmentStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id),
    }));
    return {
        appointmentCount,
        prescriptionCount,
        reviewCount,
        formattedAppointmentStatus,
    };
});
const getBarChartData = () => __awaiter(void 0, void 0, void 0, function* () {
    const appointmentCountByMonth = yield prisma_1.default.$queryRaw `
        SELECT DATE_TRUNC('month', "createdAt") AS month,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM "appointments"
        GROUP BY month
        ORDER BY month ASC
    `;
    return appointmentCountByMonth;
});
const getPieChartData = () => __awaiter(void 0, void 0, void 0, function* () {
    const appointmentStatusDistribution = yield prisma_1.default.appointment.groupBy({
        by: ["status"],
        _count: { id: true },
    });
    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id),
    }));
    return formattedAppointmentStatusDistribution;
});
exports.StatisticsServices = { statisticsDashboardDataFromDB };
