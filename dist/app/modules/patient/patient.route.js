"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientRoutes = void 0;
const express_1 = require("express");
const patient_controller_1 = require("./patient.controller");
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = (0, express_1.Router)();
router.get("/", (0, auth_1.default)(client_1.UserRole.DOCTOR, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.PATIENT), patient_controller_1.PatientControllers.getAllPatients);
router.get("/:id", patient_controller_1.PatientControllers.getSinglePatient);
router.patch("/:id", patient_controller_1.PatientControllers.updatePatient);
router.delete("/:id", patient_controller_1.PatientControllers.deletePatient);
exports.PatientRoutes = router;
