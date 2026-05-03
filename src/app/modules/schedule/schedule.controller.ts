import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ScheduleServices } from "./schedule.service";
import { IQueryParams } from "../../interface/query.interface";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
    const result = await ScheduleServices.createScheduleIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Schedule created successfully",
        data: result,
    });
});

const getAllSchedules = catchAsync(async (req: Request, res: Response) => {
    const result = await ScheduleServices.getAllSchedulesFromDB(req.query as IQueryParams);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Schedules fetched successfully",
        meta: result.meta,
        data: result.data,
    });
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ScheduleServices.deleteScheduleFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Schedule deleted successfully",
        data: result,
    });
});

export const ScheduleControllers = {
    createSchedule,
    getAllSchedules,
    deleteSchedule
};
