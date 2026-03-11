import { Router } from "express";
import { StatisticsControllers } from "./statistics.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get(
  "/stats",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  StatisticsControllers.statisticsDashboardData
);

export const StatisticsRoutes = router;
