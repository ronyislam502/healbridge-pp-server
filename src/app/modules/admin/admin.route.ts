import { Router } from "express";
import { AdminControllers } from "./admin.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { AdminValidations } from "./admin.validation";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middlewares/bodyParser";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = Router();

router.get(
  "/",
  auth(UserRole.DOCTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENT),
  AdminControllers.getAllAdmins
);

router.get("/:id", AdminControllers.getSingleAdmin);

router.patch(
  "/update/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  multerUpload.single("image"),
  parseBody,
  validateRequest(AdminValidations.updateAdminValidationSchema),
  AdminControllers.updateAdmin
);

router.delete(
  "/delete/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AdminControllers.deleteAdmin
);

export const AdminRoutes = router;
