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
exports.PaymentServices = void 0;
const prisma_1 = __importDefault(require("../../shared/prisma"));
const payment_utils_1 = require("./payment.utils");
const client_1 = require("@prisma/client");
const createPaymentIntoDB = (appointmentId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const isPayment = yield prisma_1.default.payment.findFirstOrThrow({
        where: {
            appointmentId,
        },
        include: {
            appointment: {
                include: {
                    patient: true,
                },
            },
        },
    });
    //   console.log("is", isPayment);
    const paymentData = {
        amount: isPayment === null || isPayment === void 0 ? void 0 : isPayment.amount,
        transactionId: isPayment === null || isPayment === void 0 ? void 0 : isPayment.transactionId,
        name: (_b = (_a = isPayment === null || isPayment === void 0 ? void 0 : isPayment.appointment) === null || _a === void 0 ? void 0 : _a.patient) === null || _b === void 0 ? void 0 : _b.name,
        email: (_d = (_c = isPayment === null || isPayment === void 0 ? void 0 : isPayment.appointment) === null || _c === void 0 ? void 0 : _c.patient) === null || _d === void 0 ? void 0 : _d.email,
        address: (_f = (_e = isPayment === null || isPayment === void 0 ? void 0 : isPayment.appointment) === null || _e === void 0 ? void 0 : _e.patient) === null || _f === void 0 ? void 0 : _f.address,
        phone: (_h = (_g = isPayment === null || isPayment === void 0 ? void 0 : isPayment.appointment) === null || _g === void 0 ? void 0 : _g.patient) === null || _h === void 0 ? void 0 : _h.phone,
    };
    const result = yield (0, payment_utils_1.initialPayment)(paymentData);
    return result;
});
const validatePaymentFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // if your server has production then use this uncomment but development purpose use local then comment
    // if (!payload || !payload.status || !(payload.status === 'VALID')) {
    //     return {
    //         message: "Invalid Payment!"
    //     }
    // }
    // const response = await SSLService.validatePayment(payload);
    // if (response?.status !== 'VALID') {
    //     return {
    //         message: "Payment Failed!"
    //     }
    // }
    // ----------------++++--------------//
    const response = payload; // const response = payload; (if local server use development purpose then uncomment)
    yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedPaymentData = yield tx.payment.update({
            where: {
                transactionId: response.tran_id,
            },
            data: {
                status: client_1.PaymentStatus.PAID,
                paymentGatewayData: response,
            },
        });
        yield tx.appointment.update({
            where: {
                id: updatedPaymentData.appointmentId,
            },
            data: {
                paymentStatus: client_1.PaymentStatus.PAID,
            },
        });
    }));
    return {
        message: "payment success",
    };
});
exports.PaymentServices = {
    createPaymentIntoDB,
    validatePaymentFromDB,
};
