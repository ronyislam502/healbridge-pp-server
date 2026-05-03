import { Router } from "express";
import { SpecialtiesControllers } from "./specialties.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middlewares/bodyParser";

const router = Router();

router.post(
  "/create-specialties",
  // auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  multerUpload.single("icon"), parseBody,
  SpecialtiesControllers.createSpecialties
);

router.get("/", SpecialtiesControllers.getAllSpecialties);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SpecialtiesControllers.deleteSpecialties
);

export const SpecialtiesRoutes = router;
