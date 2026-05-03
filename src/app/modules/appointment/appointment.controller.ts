import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AppointmentServices } from "./appointment.service";
import { IQueryParams } from "../../interface/query.interface";

const createAppointment = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await AppointmentServices.createAppointmentIntoDB(user, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Appointment created successfully",
        data: result,
    });
});

const getAllAppointments = catchAsync(async (req: Request, res: Response) => {
    const result = await AppointmentServices.getAllAppointmentsFromDB(req.query as IQueryParams);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Appointments fetched successfully",
        meta: result.meta,
        data: result.data,
    });
});

const getMyAppointments = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await AppointmentServices.getMyAppointmentsFromDB(user, req.query as IQueryParams);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My Appointments fetched successfully",
        meta: result.meta,
        data: result.data,
    });
});

export const AppointmentControllers = {
    createAppointment,
    getAllAppointments,
    getMyAppointments
};
