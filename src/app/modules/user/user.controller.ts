import { TImageFile } from "../../interface/image.interface";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserServices } from "./user.service";
import  httpStatus  from 'http-status';

const createAdmin = catchAsync(async (req: any, res) => {
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


export const UserControllers = {
    createAdmin
}