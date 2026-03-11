import { Router } from "express";
import { DoctorScheduleControllers } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
  "/create-doctor-schedule",
  auth(UserRole.DOCTOR),
  DoctorScheduleControllers.createDoctorSchedule
);

router.get(
  "/",
  auth(UserRole.DOCTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENT),
  DoctorScheduleControllers.allDoctorSchedules
);

router.get(
  "/get-my-schedule",
  auth(UserRole.DOCTOR),
  DoctorScheduleControllers.getMySchedule
);

router.delete(
  "/doctor-schedule/:id",
  auth(UserRole.DOCTOR),
  DoctorScheduleControllers.deleteDoctorSchedule
);

export const DoctorScheduleRoutes = router;
