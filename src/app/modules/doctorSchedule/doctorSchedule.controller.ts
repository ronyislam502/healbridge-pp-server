import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { DoctorScheduleServices } from "./doctorSchedule.service";
import { IQueryParams } from "../../interface/query.interface";

const createDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await DoctorScheduleServices.createDoctorScheduleIntoDB(user, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctor Schedule created successfully",
        data: result,
    });
});

const getMySchedules = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await DoctorScheduleServices.getMySchedulesFromDB(user, req.query as IQueryParams);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My Schedules fetched successfully",
        meta: result.meta,
        data: result.data,
    });
});

const deleteDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { id } = req.params;
    const result = await DoctorScheduleServices.deleteDoctorScheduleFromDB(user, id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctor Schedule deleted successfully",
        data: result,
    });
});

const getAllDoctorSchedules = catchAsync(async (req: Request, res: Response) => {
    const result = await DoctorScheduleServices.getAllDoctorSchedulesFromDB(req.query as IQueryParams);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All Doctor Schedules fetched successfully",
        meta: result.meta,
        data: result.data,
    });
});

export const DoctorScheduleControllers = {
    createDoctorSchedule,
    getMySchedules,
    deleteDoctorSchedule,
    getAllDoctorSchedules
};
