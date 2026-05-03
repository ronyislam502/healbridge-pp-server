import { Router } from "express";
import { AppointmentControllers } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get(
    "/",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    AppointmentControllers.getAllAppointments
);

router.get(
    "/my-appointments",
    auth(UserRole.PATIENT, UserRole.DOCTOR),
    AppointmentControllers.getMyAppointments
);

router.post(
    "/",
    auth(UserRole.PATIENT),
    AppointmentControllers.createAppointment
);

export const AppointmentRoutes = router;
