import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PaymentServices } from "./payment.service";
import httpStatus from "http-status";

const createPayment = catchAsync(async (req, res) => {
  const { appointmentId } = req.params;
  const result = await PaymentServices.createPaymentIntoDB(appointmentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment successfully",
    data: result,
  });
});

const validatePayment = catchAsync(async (req, res) => {
  const result = await PaymentServices.validatePaymentFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment validate successfully!",
    data: result,
  });
});

export const PaymentControllers = {
  createPayment,
  validatePayment,
};
