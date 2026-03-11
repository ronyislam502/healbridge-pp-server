"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const validateRequest_1 = require("../../middlewares/validateRequest");
const admin_validation_1 = require("../admin/admin.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const multer_config_1 = require("../../config/multer.config");
const bodyParser_1 = require("../../middlewares/bodyParser");
const doctor_validation_1 = require("../doctor/doctor.validation");
const patient_validation_1 = require("../patient/patient.validation");
const router = (0, express_1.Router)();
router.post("/create-admin", (0, auth_1.default)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN), multer_config_1.multerUpload.single("image"), bodyParser_1.parseBody, (0, validateRequest_1.validateRequest)(admin_validation_1.AdminValidations.createAdminValidationSchema), user_controller_1.UserControllers.CreateAdmin);
router.post("/create-doctor", (0, auth_1.default)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN), multer_config_1.multerUpload.single("image"), bodyParser_1.parseBody, (0, validateRequest_1.validateRequest)(doctor_validation_1.DoctorValidations.createDoctorSchema), user_controller_1.UserControllers.CreateDoctor);
router.post("/create-patient", 
// auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
multer_config_1.multerUpload.single("image"), bodyParser_1.parseBody, (0, validateRequest_1.validateRequest)(patient_validation_1.PatientValidations.createPatientValidationSchema), user_controller_1.UserControllers.CreatePatient);
router.get("/", (0, auth_1.default)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN), user_controller_1.UserControllers.getAllUsers);
router.get("/my-profile", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.DOCTOR, client_1.UserRole.PATIENT, client_1.UserRole.SUPER_ADMIN), user_controller_1.UserControllers.getMyProfile);
router.get("/:email", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.DOCTOR, client_1.UserRole.PATIENT, client_1.UserRole.SUPER_ADMIN), user_controller_1.UserControllers.getSingleUser);
router.patch("/:id/status", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), user_controller_1.UserControllers.changeProfileStatus);
router.patch("/update-my-profile", (0, auth_1.default)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.DOCTOR, client_1.UserRole.PATIENT), multer_config_1.multerUpload.single("image"), bodyParser_1.parseBody, user_controller_1.UserControllers.updateMyProfile);
exports.UserRoutes = router;
