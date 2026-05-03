import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { PatientRoutes } from "../modules/patient/patient.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { DoctorRoutes } from "../modules/doctor/doctor.route";
import { SpecialtiesRoutes } from "../modules/specialties/specialtiesRoute";
import { AppointmentRoutes } from "../modules/appointment/appointment.route";
import { ScheduleRoutes } from "../modules/schedule/schedule.route";
import { DoctorScheduleRoutes } from "../modules/doctorSchedule/doctorSchedule.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/admins",
    route: AdminRoutes,
  },
  {
    path: "/patients",
    route: PatientRoutes,
  },
  {
    path: "/doctors",
    route: DoctorRoutes,
  },
  {
    path: "/specialties",
    route: SpecialtiesRoutes,
  },
  {
    path: "/appointments",
    route: AppointmentRoutes,
  },
  {
    path: "/schedules",
    route: ScheduleRoutes,
  },
  {
    path: "/doctor-schedules",
    route: DoctorScheduleRoutes,
  },
];

moduleRoutes?.forEach((route) => router?.use(route?.path, route?.route));

export default router;
