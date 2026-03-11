import { Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { AdminValidations } from "../admin/admin.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middlewares/bodyParser";
import { DoctorValidations } from "../doctor/doctor.validation";
import { PatientValidations } from "../patient/patient.validation";

const router = Router();

router.post(
  "/create-admin",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  multerUpload.single("image"),
  parseBody,
  validateRequest(AdminValidations.createAdminValidationSchema),
  UserControllers.CreateAdmin
);

router.post(
  "/create-doctor",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  multerUpload.single("image"),
  parseBody,
  validateRequest(DoctorValidations.createDoctorSchema),
  UserControllers.CreateDoctor
);

router.post(
  "/create-patient",
  // auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  multerUpload.single("image"),
  parseBody,
  validateRequest(PatientValidations.createPatientValidationSchema),
  UserControllers.CreatePatient
);

router.get(
  "/",
  // auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserControllers.getAllUsers
);

router.get(
  "/my-profile",
  auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPER_ADMIN),
  UserControllers.getMyProfile
);

router.get(
  "/:email",
  auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT, UserRole.SUPER_ADMIN),
  UserControllers.getSingleUser
);

router.patch(
  "/:id/status",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserControllers.changeProfileStatus
);

router.patch(
  "/update-my-profile",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  multerUpload.single("image"),
  parseBody,
  UserControllers.updateMyProfile
);

export const UserRoutes = router;
