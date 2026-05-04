import { Router } from "express";
import { DoctorControllers } from "./doctor.controller";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middlewares/bodyParser";

import { validateRequest } from "../../middlewares/validateRequest";
import { DoctorValidations } from "./doctor.validation";


const router = Router();

router.get("/", DoctorControllers.allDoctors);

router.get("/:id", DoctorControllers.singleDoctor);

router.patch("/update/:id",
    multerUpload.single("avatar"),
    parseBody,
    validateRequest(DoctorValidations.updateDoctorSchema),
    DoctorControllers.updateDoctor);


router.patch(
  "/update-specialties/:id",
  validateRequest(DoctorValidations.updateDoctorSpecialtiesSchema),
  DoctorControllers.updateDoctorSpecialties
);

router.delete("/delete/:id", DoctorControllers.deleteDoctor);



export const DoctorRoutes = router;