import { Router } from "express";
import { UserControllers } from "./user.controller";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middlewares/bodyParser";
import { validateRequest } from "../../middlewares/validateRequest";
import { AdminValidations } from "../admin/admin.validation";
import { DoctorValidations } from "../doctor/doctor.validation";
import { PatientValidations } from "../patient/patient.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/create-admin",
    multerUpload.single("avatar"),
    parseBody,
    validateRequest(AdminValidations.createAdminValidationSchema),
    UserControllers.createAdmin);

router.post("/create-doctor",
    multerUpload.single("avatar"),
    parseBody,
    validateRequest(DoctorValidations.createDoctorSchema),
    UserControllers.createDoctor);

router.post("/create-patient",
    multerUpload.single("avatar"),
    parseBody,
    validateRequest(PatientValidations.createPatientValidationSchema),
    UserControllers.createPatient);

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