import { Review } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../../shared/prisma";
import AppError from "../../errors/AppError";
import HealthQueryBuilder from "../../builder/healthQuery";

const createReviewIntoDB = async (user: JwtPayload, payload: Review) => {
  const isAppointment = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
    include: {
      patient: true,
    },
  });

  if (user.email !== isAppointment.patient.email) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "this appointment is not your appointment"
    );
  }

  const result = await prisma.review.create({
    data: {
      appointmentId: payload.appointmentId,
      doctorId: payload.doctorId,
      patientId: payload.patientId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });

  return result;
};

const getAllReviewsFromDB = async (query: Record<string, unknown>) => {
  const reviewQuery = new HealthQueryBuilder(prisma.review, query)
    .filter()
    .sort()
    .paginate()
    .fields()
    .setInclude({
      doctor: true,
      patient: true,
    });

  const meta = await reviewQuery.countTotal();
  const data = await reviewQuery.execute();

  const totalRating = data.reduce(
    (sum: any, review: any) => sum + review.rating,
    0
  );
  const averageRating =
    data.length > 0 ? (totalRating / data.length).toFixed(2) : "0.00";

  return { meta, data, totalRating, averageRating };
};

export const ReviewServices = {
  createReviewIntoDB,
  getAllReviewsFromDB,
};
