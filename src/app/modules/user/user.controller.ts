import { JwtPayload } from "jsonwebtoken";
import { TImageFile } from "../../interface/image.interface";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserServices } from "./user.service";
import  httpStatus  from 'http-status';
import { IQueryParams } from "../../interface/query.interface";

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

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsersFromDB(req.query as IQueryParams);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const { email } = req.params;
  const result = await UserServices.getSingleUserFromDB(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const changeProfileStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.changeProfileStatusFromDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile status changed successfully",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await UserServices.getMyProfileFromDB(user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My Profile retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req, res) => {
  const result = await UserServices.updateMyProfileIntoDB(
    req.user as JwtPayload,
    req.file as TImageFile,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My Profile update successfully",
    data: result,
  });
});




export const UserControllers = {
    createAdmin,
    createDoctor,
    createPatient,
    getAllUsers,
    getSingleUser,
    changeProfileStatus,
    getMyProfile,
    updateMyProfile
}