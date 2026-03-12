import { JwtPayload } from "jsonwebtoken";
import prisma, { TransactionClient } from "../../shared/prisma";
import { v4 as uuidv4 } from "uuid";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import {
  Appointment,
  AppointmentStatus,
  PaymentStatus,
  UserRole,
} from "@prisma/client";
import HealthQueryBuilder from "../../builder/healthQuery";
import { stripe } from "../../shared/stripe";

const createAppointmentIntoDB = async (
  user: JwtPayload,
  payload: Appointment
) => {
  const isPatient = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const isDoctor = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
    },
  });

  const isSchedule = await prisma.doctorSchedules.findFirst({
    where: {
      doctorId: isDoctor.id,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  if (!isSchedule) {
    throw new AppError(httpStatus.NOT_FOUND, "This schedule not found");
  }

  const videoCallingId: string = uuidv4();

  const result = await prisma.$transaction(
    async (transactionClient: TransactionClient) => {
      const appointmentData = await transactionClient.appointment.create({
        data: {
          patientId: isPatient.id,
          doctorId: isDoctor.id,
          scheduleId: payload.scheduleId,
          videoCallingId,
        },
        include: {
          patient: true,
          doctor: true,
          schedule: true,
        },
      });

      await transactionClient.doctorSchedules.update({
        where: {
          doctorId_scheduleId: {
            doctorId: isDoctor.id,
            scheduleId: payload.scheduleId,
          },
        },
        data: {
          isBooked: true,
          appointmentId: appointmentData.id,
        },
      });

      const today = new Date();
      console.log("to", today);
      const transactionId =
        "HB" +
        today.getFullYear() +
        +today.getMonth() +
        +today.getDay() +
        +today.getHours() +
        +today.getMinutes() +
        +today.getSeconds();

      console.log("trans_id", transactionId);

     const paymentData= await transactionClient.payment.create({
        data: {
          appointmentId: appointmentData.id,
          amount: isDoctor.appointmentFee,
          transactionId,
        },
      });

      const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Appointment with ${isDoctor.name}`,
                },
                unit_amount: paymentData.amount * 100,
              },
              quantity: 1,
            },
          ],
        mode: "payment",
          success_url: `https://www.programming-hero.com/`,
          cancel_url: `https://next.programming-hero.com/`,
          // success_url: `${config.reset_pass_link}/success?session_id={CHECKOUT_SESSION_ID}`,
          // cancel_url: `${config.reset_pass_link}/cancel`,
          customer_email: isPatient.email,
          metadata: {
            appointmentId: paymentData.appointmentId,
            transactionId: paymentData.transactionId,
        },
           payment_intent_data: {
             metadata: {
             appointmentId: appointmentData.id,
             transactionId,
          },
        },
      });
       return { paymentUrl: session.url };
      // return appointmentData;
    }
  );

  return result;
};

const getMyAppointmentsFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>
) => {
  let profileInfo;

  if (user.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.findUnique({
      where: {
        email: user.email,
      },
    });

    if (profileInfo?.id) {
      query.doctorId = profileInfo.id;
    }
  } else if (user.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.findUnique({
      where: {
        email: user.email,
      },
    });

    if (profileInfo?.id) {
      query.patientId = profileInfo.id;
    }
  }

  const appointmentQuery = new HealthQueryBuilder(prisma.appointment, query)
    .filter()
    .sort()
    .paginate()
    .fields()
    .setInclude(
      user?.role === UserRole.PATIENT
        ? { doctor: true, schedule: true }
        : {
            patient: {
              include: { medicalReport: true, patientHealthData: true },
            },
            schedule: true,
          }
    );

  const meta = await appointmentQuery.countTotal();
  const data = await appointmentQuery.execute();

  console.log(data?.patient?.email);

  return { meta, data };
};

const getAllAppointmentsFromDB = async (query: Record<string, unknown>) => {
  const appointmentsQuery = new HealthQueryBuilder(prisma.appointment, query)
    .filter()
    .sort()
    .paginate()
    .fields()
    .setInclude({
      doctor: true,
      patient: true,
      schedule: true,
      payment: true,
    });

  const meta = await appointmentsQuery.countTotal();
  const data = await appointmentsQuery.execute();

  return { meta, data };
};

const changeAppointmentStatusIntoDB = async (
  user: JwtPayload,
  appointmentId: string,
  status: AppointmentStatus
) => {
  const isAppointment = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
    },
    include: {
      doctor: true,
    },
  });

  if (user.role === UserRole.DOCTOR) {
    if (!(user.email === isAppointment.doctor.email)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "this is not your appointment"
      );
    }
  }
  const result = await prisma.appointment.update({
    where: {
      id: isAppointment.id,
    },
    data: {
      status,
    },
  });

  return result;
};

const cancelUnPaidAppointments = async () => {
  const thirtyMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  console.log(thirtyMinAgo);

  const unPaidAppointments = await prisma.appointment.findMany({
    where: {
      createdAt: {
        lte: thirtyMinAgo,
      },
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  const appointmentIdsToCancel = unPaidAppointments.map(
    (appointment) => appointment.id
  );

  await prisma.$transaction(async (tx) => {
    await tx.payment.deleteMany({
      where: {
        appointmentId: {
          in: appointmentIdsToCancel,
        },
      },
    });

    for (const unPaidAppointment of unPaidAppointments) {
      await tx.doctorSchedules.updateMany({
        where: {
          doctorId: unPaidAppointment.doctorId,
          scheduleId: unPaidAppointment.scheduleId,
        },
        data: {
          isBooked: false,
        },
      });
    }
  });
};

export const AppointmentServices = {
  createAppointmentIntoDB,
  getMyAppointmentsFromDB,
  getAllAppointmentsFromDB,
  changeAppointmentStatusIntoDB,
  cancelUnPaidAppointments,
};
