import { IQueryParams } from "../../interface/query.interface";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PrescriptionServices } from "./prescription.service";
import httpStatus  from 'http-status';

const createPrescription = catchAsync(async (req, res) => {
  const result = await PrescriptionServices.createPrescriptionIntoDB(
    req.user,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescription created successfully",
    data: result,
  });
});

const allPrescriptions = catchAsync(async (req, res) => {
  const result = await PrescriptionServices.allPrescriptionsFromDB(
    req.query as IQueryParams
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient prescriptions retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getPatientPrescriptions = catchAsync(async (req, res) => {
  const result = await PrescriptionServices.getPatientPrescriptionsFromDB(
    req.user,
    req.query as IQueryParams
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescription created successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const PrescriptionControllers = {
  createPrescription,
  allPrescriptions,
  getPatientPrescriptions,
};
