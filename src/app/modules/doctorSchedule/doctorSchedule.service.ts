import { JwtPayload } from "jsonwebtoken";
import prisma from "../../shared/prisma";
import HealthQueryBuilder from "../../builder/healthQuery";
import AppError from "../../errors/AppError";

const createDoctorScheduleIntoDB = async (user: any, payload: any) => {
  const isDoctor = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const schedule = payload.scheduleIds.map((scheduleId: string) => ({
    doctorId: isDoctor.id,
    scheduleId,
  }));

  const result = await prisma.doctorSchedules.createMany({
    data: schedule,
  });

  return result;
};

const getAllDoctorScheduleFromDB = async (query: Record<string, unknown>) => {
  const doctorScheduleQuery = new HealthQueryBuilder(
    prisma.doctorSchedules,
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields()
    .setInclude({
      doctor: true,
      schedule: true,
    });

  const meta = await doctorScheduleQuery.countTotal();
  const data = await doctorScheduleQuery.execute();

  return { meta, data };
};

const getMyScheduleFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>
) => {
  const isDoctor = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  query.doctorId = isDoctor.id;

  const doctorScheduleQuery = new HealthQueryBuilder(
    prisma.doctorSchedules,
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields()
    .setInclude({
      schedule: true,
      doctor: true,
    });

  const meta = await doctorScheduleQuery.countTotal();
  const data = await doctorScheduleQuery.execute();

  return { meta, data };
};

const deleteDoctorScheduleFromDB = async (user: JwtPayload, id: string) => {
  const isDoctor = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const isBookedSchedule = await prisma.doctorSchedules.findFirst({
    where: {
      doctorId: isDoctor.id,
      scheduleId: id,
      isBooked: true,
    },
  });

  if (isBookedSchedule) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can not delete this schedule cause schedule already booked!"
    );
  }

  const result = await prisma.doctorSchedules.delete({
    where: {
      doctorId_scheduleId: {
        doctorId: isDoctor.id,
        scheduleId: id,
      },
    },
  });

  return result;
};

export const DoctorScheduleServices = {
  createDoctorScheduleIntoDB,
  getMyScheduleFromDB,
  deleteDoctorScheduleFromDB,
  getAllDoctorScheduleFromDB,
};
