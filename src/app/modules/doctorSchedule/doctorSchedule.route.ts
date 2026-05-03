import { Router } from "express";
import { DoctorScheduleControllers } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get(
    "/",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
    DoctorScheduleControllers.getAllDoctorSchedules
);

router.get(
    "/my-schedules",
    auth(UserRole.DOCTOR),
    DoctorScheduleControllers.getMySchedules
);

router.post(
    "/",
    auth(UserRole.DOCTOR),
    DoctorScheduleControllers.createDoctorSchedule
);

router.delete(
    "/:id",
    auth(UserRole.DOCTOR),
    DoctorScheduleControllers.deleteDoctorSchedule
);

export const DoctorScheduleRoutes = router;
