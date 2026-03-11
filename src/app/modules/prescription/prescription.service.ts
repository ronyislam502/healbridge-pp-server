import { AppointmentStatus, PaymentStatus, Prescription } from "@prisma/client";
import prisma from "../../shared/prisma";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errors/AppError";
import HealthQueryBuilder from "../../builder/healthQuery";

const createPrescriptionIntoDB = async (
  user: JwtPayload,
  payload: Prescription
) => {
  const isAppointment = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      doctor: true,
    },
  });

  if (!(user.email === isAppointment.doctor.email)) {
    throw new AppError(httpStatus.BAD_REQUEST, "This is not your appointment");
  }

  const result = await prisma.prescription.create({
    data: {
      appointmentId: isAppointment.id,
      doctorId: isAppointment.doctor.id,
      patientId: isAppointment.patientId,
      introduction: payload.introduction as string,
      followUpDate: payload.followUpDate,
    },
    include: {
      patient: true,
    },
  });

  return result;
};

const getAllPrescriptionsFromDB = async (query: Record<string, unknown>) => {
  const prescriptionQuery = new HealthQueryBuilder(prisma.prescription, query)
    .filter()
    .sort()
    .paginate()
    .fields()
    .setInclude({
      doctor: true,
      patient: true,
      appointment: true,
    });

  const meta = await prescriptionQuery.countTotal();
  const data = await prescriptionQuery.execute();

  return { meta, data };
};

const getPatientPrescriptionsFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>
) => {
  const isPatient = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  query.id = isPatient.id;

  const prescriptionQuery = new HealthQueryBuilder(prisma.prescription, query)
    .filter()
    .sort()
    .paginate()
    .fields()
    .setInclude({
      doctor: true,
      appointment: true,
    });

  const meta = await prescriptionQuery.countTotal();
  const data = await prescriptionQuery.execute();

  return { meta, data };
};

export const PrescriptionServices = {
  createPrescriptionIntoDB,
  getAllPrescriptionsFromDB,
  getPatientPrescriptionsFromDB,
};
