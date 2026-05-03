import { z } from "zod";

const createReviewSchema = z.object({
  body: z.object({
    appointmentId: z
      .string()
      .min(1, "Appointment Id is required"),

    rating: z
      .number()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot be more than 5"),

    comment: z
      .string()
      .min(1, "Comment is required")
      .max(500, "Comment too long"),
  }),
});

export const ReviewValidation = {
  createReviewSchema,
};