import { TImageFile } from "../../interface/image.interface";
import { IQueryParams } from "../../interface/query.interface";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus  from 'http-status';
import { DoctorServices } from "./doctor.service";
import { AdminServices } from "../admin/admin.service";

const allDoctors = catchAsync(async (req, res) => {
    const result = await DoctorServices.allDoctorsFromDB(req.query as IQueryParams);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctors Retrieved Successfully",
        meta:result.meta,
        data:result.data,
    })
})

const singleDoctor = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await DoctorServices.singleDoctorFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctors Retrieved Successfully",
        data:result,
    })
})


const updateDoctor = catchAsync(async (req: any, res) => {
    const { id } = req.params;
    const { doctor } = req.body;
    const result = await DoctorServices.updateDoctorIntoDB(
        id,
        req.file as TImageFile,
        doctor
    );
    
    sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor Updated Successfully",
    data: result,
  });
})

const deleteDoctor = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DoctorServices.deleteDoctorFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor deleted successfully",
    data: result,
  });
});

export const DoctorControllers = {
    allDoctors,
    singleDoctor,
    updateDoctor,
    deleteDoctor
}
