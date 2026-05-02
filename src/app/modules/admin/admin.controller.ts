import { TImageFile } from "../../interface/image.interface";
import { IQueryParams } from "../../interface/query.interface";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AdminServices } from "./admin.service";
import httpStatus  from 'http-status';

const allAdmins = catchAsync(async (req, res) => {
    const result = await AdminServices.allAdminsFromDB(req.query as IQueryParams);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admins Retrieved Successfully",
        meta:result.meta,
        data:result.data,
    })
})

const singleAdmin = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await AdminServices.singleAdminFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admins Retrieved Successfully",
        data:result,
    })
})


const updateAdmin = catchAsync(async (req: any, res) => {
    const { id } = req.params;
    const { admin } = req.body;
    const result = await AdminServices.updateAdminIntoDB(
        id,
        req.file as TImageFile,
        admin
    );
    
    sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin Updated Successfully",
    data: result,
  });
})

export const AdminControllers = {
    allAdmins,
    singleAdmin,
    updateAdmin
}
