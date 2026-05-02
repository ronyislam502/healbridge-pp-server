import { TImageFile } from "../../interface/image.interface";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserServices } from "./user.service";
import  httpStatus  from 'http-status';

const createAdmin = catchAsync(async (req, res) => {
    const { password, admin } = req.body;
   const result = await UserServices.createAdminIntoDB(
    req.file as TImageFile,
    password,
    admin
    );
    
    sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin Created Successfully",
    data: result,
  });
})

const createDoctor = catchAsync(async (req, res) => {
    const { password, doctor } = req.body;
   const result = await UserServices.createDoctorIntoDB(
    req.file as TImageFile,
    password,
    doctor
    );
    
    sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor Created Successfully",
    data: result,
  });
})

const createPatient = catchAsync(async (req, res) => {
    const { password, patient } = req.body;
   const result = await UserServices.createPatientIntoDB(
    req.file as TImageFile,
    password,
    patient
    );
    
    sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient Created Successfully",
    data: result,
  });
})



export const UserControllers = {
    createAdmin,
    createDoctor,
    createPatient
}