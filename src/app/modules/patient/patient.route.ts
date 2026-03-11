import { Router } from "express";
import { PatientControllers } from "./patient.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = Router();

router.get(
  "/",
  auth(UserRole.DOCTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENT),
  PatientControllers.getAllPatients
);

router.get("/:id", PatientControllers.getSinglePatient);

router.patch("/:id", PatientControllers.updatePatient);

router.delete("/:id", PatientControllers.deletePatient);

export const PatientRoutes = router;
