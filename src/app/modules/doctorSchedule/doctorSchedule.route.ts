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
    DoctorScheduleControllers.getAllDoctorSchedules
);

router.get(
    "/my-schedules",
    auth(UserRole.DOCTOR),
    DoctorScheduleControllers.getMySchedules
);

router.delete(
    "/:id",
    auth(UserRole.DOCTOR),
    DoctorScheduleControllers.deleteDoctorSchedule
);

export const DoctorScheduleRoutes = router;
