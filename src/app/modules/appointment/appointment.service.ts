import { Appointment, AppointmentStatus, PaymentStatus, Prisma } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import prisma from "../../shared/prisma";
import { IQueryParams } from "../../interface/query.interface";
import { QueryBuilder } from "../../builder/queryBuilder";
import { appointmentSearchableFields } from "./appointment.interface";

const createAppointmentIntoDB = async (user: any, payload: any) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId
        }
    });

    await prisma.doctorSchedules.findFirstOrThrow({
        where: {
            doctorId: doctorData.id,
            scheduleId: payload.scheduleId,
            isBooked: false
        }
    });

    const videoCallingId = uuidv4();

    const result = await prisma.$transaction(async (transactionClient) => {
        const appointmentData = await transactionClient.appointment.create({
            data: {
                patientId: patientData.id,
                doctorId: doctorData.id,
                scheduleId: payload.scheduleId,
                videoCallingId
            },
            include: {
                patient: true,
                doctor: true,
                schedule: true
            }
        });

        await transactionClient.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: payload.scheduleId
                }
            },
            data: {
                isBooked: true,
                appointmentId: appointmentData.id
            }
        });

        const today = new Date();
        const transactionId = "PH-" + today.getFullYear() + (today.getMonth() + 1) + today.getDate() + today.getHours() + today.getMinutes();

        await transactionClient.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId
            }
        });

        return appointmentData;
    });

    return result;
};

const getAllAppointmentsFromDB = async (query: IQueryParams) => {
    const appointmentQuery = new QueryBuilder<Appointment>(prisma.appointment, query)
        .search(appointmentSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields()
        .include({
            patient: true,
            doctor: true,
            schedule: true,
            payment: true
        });

    const data = await appointmentQuery.execute();
    const meta = await appointmentQuery.countTotal();

    return { data, meta };
};

const getMyAppointmentsFromDB = async (user: any, query: IQueryParams) => {
    const patientData = await prisma.patient.findUnique({
        where: {
            email: user?.email
        }
    });

    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user?.email
        }
    });

    const where: Prisma.AppointmentWhereInput = {};

    if (patientData) {
        where.patientId = patientData.id;
    } else if (doctorData) {
        where.doctorId = doctorData.id;
    }

    const appointmentQuery = new QueryBuilder<Appointment>(prisma.appointment, query)
        .where(where as any)
        .search(appointmentSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields()
        .include({
            patient: true,
            doctor: true,
            schedule: true,
            payment: true
        });

    const data = await appointmentQuery.execute();
    const meta = await appointmentQuery.countTotal();

    return { data, meta };
};

export const AppointmentServices = {
    createAppointmentIntoDB,
    getAllAppointmentsFromDB,
    getMyAppointmentsFromDB
};
