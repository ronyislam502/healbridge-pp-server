import { DoctorSchedules, Prisma } from "@prisma/client";
import prisma from "../../shared/prisma";
import { IQueryParams } from "../../interface/query.interface";
import { QueryBuilder } from "../../builder/queryBuilder";
import { JwtPayload } from "jsonwebtoken";

const createDoctorScheduleIntoDB = async (user: JwtPayload, payload: { scheduleIds: string[] }) => {
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
    user: JwtPayload,
    query: IQueryParams
) => {

    const isDoctor = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });

    query.doctorId = isDoctor.id;

    const doctorScheduleQuery = new QueryBuilder<DoctorSchedules>(prisma.doctorSchedules, query)
        .filter()
        .sort()
        .paginate()
        .fields()
        .include({
            schedule: true,
            doctor:true
        });


    const data = await doctorScheduleQuery.execute();
    const meta = await doctorScheduleQuery.countTotal();

    return {
        data,
        meta
    };
};

const deleteDoctorScheduleFromDB = async (user: JwtPayload, scheduleId: string) => {
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
   
    const doctorScheduleQuery = new QueryBuilder<DoctorSchedules>(prisma.doctorSchedules, query)
        .filter()
        .sort()
        .paginate()
        .fields()
        .include({
            doctor: true,
            schedule: true
        });

    const data = await doctorScheduleQuery.execute();
    const meta = await doctorScheduleQuery.countTotal();

    return {
        meta,
        data
    };
};

export const DoctorScheduleServices = {
    createDoctorScheduleIntoDB,
    getMySchedulesFromDB,
    deleteDoctorScheduleFromDB,
    getAllDoctorSchedulesFromDB
};
