import { Router } from "express";
import { PatientControllers } from "./patient.controller";

const router = Router();

router.get(
  "/",
  PatientControllers.allPatients
);

router.get("/:id", PatientControllers.singlePatient);

router.patch("/update/:id", PatientControllers.updatePatient);

router.delete("/delete/:id", PatientControllers.deletePatient);

export const PatientRoutes = router;
