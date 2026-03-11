import { Router } from "express";
import { ReviewControllers } from "./review.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { validateRequest } from "../../middlewares/validateRequest";
import { ReviewValidation } from "./review.validation";

const router = Router();

router.post(
  "/create-review",
  auth(UserRole.PATIENT),
  validateRequest(ReviewValidation.create),
  ReviewControllers.createReview
);

router.get("/", ReviewControllers.allReviews);

export const ReviewRoutes = router;
