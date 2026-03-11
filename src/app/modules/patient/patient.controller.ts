import { TImageFile } from "../../interface/image.interface";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PatientServices } from "./patient.service";
import httpStatus from "http-status";

const getAllPatients = catchAsync(async (req, res) => {
  const result = await PatientServices.getAllPatientsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patients reprieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSinglePatient = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PatientServices.getSinglePatientFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient reprieved successfully",
    data: result,
  });
});

const deletePatient = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PatientServices.deletePatientFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient deleted successfully",
    data: result,
  });
});

const updatePatient = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PatientServices.updatePatientIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient updated successfully",
    data: result,
  });
});

export const PatientControllers = {
  getAllPatients,
  getSinglePatient,
  deletePatient,
  updatePatient,
};
