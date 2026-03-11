import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { SpecialtiesServices } from "./specialties.service";
import httpStatus from "http-status";

const createSpecialties = catchAsync(async (req, res) => {
  const result = await SpecialtiesServices.createSpecialtiesIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties created Successfully",
    data: result,
  });
});

const getAllSpecialties = catchAsync(async (req, res) => {
  const result = await SpecialtiesServices.getAllSpecialtiesFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties reprieved Successfully",
    data: result,
  });
});

const deleteSpecialties = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SpecialtiesServices.deleteSpecialtiesFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialty deleted Successfully",
    data: result,
  });
});

export const SpecialtiesControllers = {
  createSpecialties,
  getAllSpecialties,
  deleteSpecialties,
};
