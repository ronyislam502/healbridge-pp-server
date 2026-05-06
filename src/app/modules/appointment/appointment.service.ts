import { Appointment, Prisma } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import prisma, { TransactionClient } from "../../shared/prisma";
import { IQueryParams } from "../../interface/query.interface";
import { QueryBuilder } from "../../builder/queryBuilder";
import { appointmentSearchableFields } from "./appointment.interface";
import { stripe } from "../../shared/stripe";
import AppError from "../../errors/AppError";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";

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
    }
  );

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

const getMyAppointmentsFromDB = async (user: JwtPayload, query: IQueryParams) => {
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
