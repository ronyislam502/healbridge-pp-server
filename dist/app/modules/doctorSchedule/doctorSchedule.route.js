"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorScheduleRoutes = void 0;
const express_1 = require("express");
const doctorSchedule_controller_1 = require("./doctorSchedule.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.post("/create-doctor-schedule", (0, auth_1.default)(client_1.UserRole.DOCTOR), doctorSchedule_controller_1.DoctorScheduleControllers.createDoctorSchedule);
router.get("/", (0, auth_1.default)(client_1.UserRole.DOCTOR, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.PATIENT), doctorSchedule_controller_1.DoctorScheduleControllers.allDoctorSchedules);
router.get("/get-my-schedule", (0, auth_1.default)(client_1.UserRole.DOCTOR), doctorSchedule_controller_1.DoctorScheduleControllers.getMySchedule);
router.delete("/doctor-schedule/:id", (0, auth_1.default)(client_1.UserRole.DOCTOR), doctorSchedule_controller_1.DoctorScheduleControllers.deleteDoctorSchedule);
exports.DoctorScheduleRoutes = router;
