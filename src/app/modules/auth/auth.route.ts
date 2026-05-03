import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { AuthValidations } from "./auth.validation";

const router = Router();

router.post("/login", AuthControllers.loginUser);

router.post("/refresh-token", AuthControllers.refreshToken);

router.post(
  "/change-password",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  validateRequest(AuthValidations.changePasswordValidationSchema),
  AuthControllers.changePassword
);

router.post(
  "/forgot-password",
  // auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  validateRequest(AuthValidations.forgetPasswordValidationSchema),
  AuthControllers.forgotPassword
);

router.post(
  "/reset-password",
  // auth(UserRole.ADMIN),
  AuthControllers.resetPassword
);

export const AuthRoutes = router;
