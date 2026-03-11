"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentRoutes = void 0;
const express_1 = require("express");
const appointment_controller_1 = require("./appointment.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.post("/create-appointment", (0, auth_1.default)(client_1.UserRole.PATIENT), appointment_controller_1.AppointmentControllers.createAppointment);
router.get("/my-appointments", (0, auth_1.default)(client_1.UserRole.PATIENT, client_1.UserRole.DOCTOR), appointment_controller_1.AppointmentControllers.getMyAppointment);
router.get("/", (0, auth_1.default)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN), appointment_controller_1.AppointmentControllers.allAppointments);
router.patch("/status/:appointmentId", (0, auth_1.default)(client_1.UserRole.DOCTOR, client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), appointment_controller_1.AppointmentControllers.changeAppointmentStatus);
exports.AppointmentRoutes = router;
