"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePayment = exports.initialPayment = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const config_1 = __importDefault(require("../../config"));
dotenv_1.default.config();
const initialPayment = (paymentData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const data = {
            store_id: config_1.default.ssl_store_id,
            store_passwd: config_1.default.ssl_store_pass,
            total_amount: paymentData.amount,
            currency: "BDT",
            tran_id: paymentData.transactionId,
            success_url: `${config_1.default.live_server_url}/api/v1/success`,
            fail_url: `${config_1.default.live_server_url}/api/v1/fail`,
            cancel_url: "http://localhost:3030/cancel",
            ipn_url: "http://localhost:3030/ipn",
            shipping_method: "N/A",
            product_name: "Appointment",
            product_category: "Service",
            product_profile: "general",
            cus_name: paymentData.name,
            cus_email: paymentData.email,
            cus_add1: paymentData.address,
            cus_add2: "N/A",
            cus_city: "N/A",
            cus_state: "N/A",
            cus_postcode: "N/A",
            cus_country: "Bangladesh",
            cus_phone: paymentData.phone,
            cus_fax: "N/A",
            ship_name: "N/A",
            ship_add1: "N/A",
            ship_add2: "N/A",
            ship_city: "N/A",
            ship_state: "N/A",
            ship_postcode: "N/A",
            ship_country: "N/A",
        };
        const response = yield (0, axios_1.default)({
            method: "post",
            url: config_1.default.ssl_payment_api,
            data: data,
            headers: { "Content-type": "application/x-www-form-urlencoded" },
        });
        return (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.redirectGatewayURL;
    }
    catch (error) {
        throw new AppError_1.default(httpStatus.BAD_REQUEST, "Payment error occured!");
    }
});
exports.initialPayment = initialPayment;
const validatePayment = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, axios_1.default)({
            method: "GET",
            url: `${config_1.default.ssl_validation_api}?val_id=${payload.val_id}&store_id=${config_1.default.ssl_store_id}&store_passwd=${config_1.default.ssl_store_pass}&format=json`,
        });
        return response.data;
    }
    catch (error) {
        throw new AppError_1.default(httpStatus.BAD_REQUEST, "Payment validate failed");
    }
});
exports.validatePayment = validatePayment;
