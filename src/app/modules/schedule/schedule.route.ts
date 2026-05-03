import { Router } from "express";
import { ScheduleControllers } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { validateRequest } from "../../middlewares/validateRequest";
import { ScheduleValidations } from "./schedule.validation";

const router = Router();

router.get(
    "/",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
    ScheduleControllers.getAllSchedules
);

router.post(
    "/",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    validateRequest(ScheduleValidations.createSchedule),
    ScheduleControllers.createSchedule
);

router.delete(
    "/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    ScheduleControllers.deleteSchedule
);

export const ScheduleRoutes = router;
