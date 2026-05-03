import { DoctorSchedules, Prisma } from "@prisma/client";
import prisma from "../../shared/prisma";
import { IQueryParams } from "../../interface/query.interface";
import { QueryBuilder } from "../../builder/queryBuilder";
import { IDoctorScheduleFilterRequest } from "./doctorSchedule.interface";

const createDoctorScheduleIntoDB = async (user: any, payload: { scheduleIds: string[] }) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });

    const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
        doctorId: doctorData.id,
        scheduleId
    }));

    const result = await prisma.doctorSchedules.createMany({
        data: doctorScheduleData
    });

    return result;
};

const getMySchedulesFromDB = async (
    user: any,
    query: IQueryParams
) => {
    const { searchTerm, ...filterData } = query;

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });

    const doctorScheduleQuery = new QueryBuilder<DoctorSchedules>(prisma.doctorSchedules, query)
        .where({ doctorId: doctorData.id })
        .filter()
        .sort()
        .paginate()
        .fields()
        .include({
            schedule: true
        });

    if (Object.keys(filterData).length > 0) {
        doctorScheduleQuery.where(filterData as any);
    }

    const result = await doctorScheduleQuery.execute();
    const meta = await doctorScheduleQuery.countTotal();

    return {
        meta,
        data: result
    };
};

const deleteDoctorScheduleFromDB = async (user: any, scheduleId: string) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });

    const result = await prisma.doctorSchedules.delete({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId
            }
        }
    });

    return result;
};

const getAllDoctorSchedulesFromDB = async (
    query: IQueryParams
) => {
    const { searchTerm, ...filterData } = query;

    const doctorScheduleQuery = new QueryBuilder<DoctorSchedules>(prisma.doctorSchedules, query)
        .filter()
        .sort()
        .paginate()
        .fields()
        .include({
            doctor: true,
            schedule: true
        });

    if (searchTerm) {
        doctorScheduleQuery.where({
            doctor: {
                name: {
                    contains: searchTerm,
                    mode: 'insensitive'
                }
            }
        });
    }

    if (Object.keys(filterData).length > 0) {
        doctorScheduleQuery.where(filterData as any);
    }

    const result = await doctorScheduleQuery.execute();
    const meta = await doctorScheduleQuery.countTotal();

    return {
        meta,
        data: result
    };
};

export const DoctorScheduleServices = {
    createDoctorScheduleIntoDB,
    getMySchedulesFromDB,
    deleteDoctorScheduleFromDB,
    getAllDoctorSchedulesFromDB
};
