import { Router } from "express";
import { DoctorControllers } from "./doctor.controller";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middlewares/bodyParser";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get(
  "/",
  auth(UserRole.DOCTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENT),
  DoctorControllers.getAllDoctors
);

router.get(
  "/:id",
  auth(UserRole.DOCTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENT),
  DoctorControllers.getSingleDoctor
);

router.patch(
  "/:id",
  auth(UserRole.DOCTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorControllers.updateDoctor
);

router.delete(
  "/:id",
  auth(UserRole.DOCTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorControllers.deleteDoctor
);

export const DoctorRoutes = router;
