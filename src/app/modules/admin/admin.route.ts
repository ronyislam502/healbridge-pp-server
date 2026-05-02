import { Router } from "express";
import { AdminControllers } from "./admin.controller";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middlewares/bodyParser";
import { validateRequest } from "../../middlewares/validateRequest";
import { AdminValidations } from "./admin.validation";

const router = Router();

router.get("/", AdminControllers.allAdmins);

router.get("/:id", AdminControllers.singleAdmin);

router.patch("/update/:id",
    multerUpload.single("avatar"),
    parseBody,
    validateRequest(AdminValidations.updateAdminValidationSchema),
    AdminControllers.updateAdmin);


export const AdminRoutes = router;