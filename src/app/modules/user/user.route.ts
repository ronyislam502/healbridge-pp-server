import { Router } from "express";
import { UserControllers } from "./user.controller";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middlewares/bodyParser";
import { validateRequest } from "../../middlewares/validateRequest";
import { AdminValidations } from "../admin/admin.validation";
import { DoctorValidations } from "../doctor/doctor.validation";
import { PatientValidations } from "../patient/patient.validation";

const router = Router();

router.post("/create-admin",
    multerUpload.single("avatar"),
    parseBody,
    validateRequest(AdminValidations.createAdminValidationSchema),
    UserControllers.createAdmin);

router.post("/create-doctor",
    multerUpload.single("avatar"),
    parseBody,
    validateRequest(DoctorValidations.createDoctorSchema),
    UserControllers.createDoctor);

router.post("/create-patient",
    multerUpload.single("avatar"),
    parseBody,
    validateRequest(PatientValidations.createPatientValidationSchema),
    UserControllers.createPatient);



export const UserRoutes = router;