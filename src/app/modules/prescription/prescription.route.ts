import { Router } from "express";
import { PrescriptionControllers } from "./prescription.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
  "/create-prescription",
  auth(UserRole.DOCTOR),
  PrescriptionControllers.createPrescription
);

router.get(
  "/",
  auth(UserRole.DOCTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PrescriptionControllers.getAllPrescriptions
);

router.get(
  "/patient",
  auth(UserRole.DOCTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENT),
  PrescriptionControllers.getPatientPrescriptions
);

export const PrescriptionRoutes = router;
