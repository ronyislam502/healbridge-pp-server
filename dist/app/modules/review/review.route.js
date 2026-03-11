"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = require("express");
const review_controller_1 = require("./review.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const validateRequest_1 = require("../../middlewares/validateRequest");
const review_validation_1 = require("./review.validation");
const router = (0, express_1.Router)();
router.post("/create-review", (0, auth_1.default)(client_1.UserRole.PATIENT), (0, validateRequest_1.validateRequest)(review_validation_1.ReviewValidation.create), review_controller_1.ReviewControllers.createReview);
router.get("/", review_controller_1.ReviewControllers.allReviews);
exports.ReviewRoutes = router;
