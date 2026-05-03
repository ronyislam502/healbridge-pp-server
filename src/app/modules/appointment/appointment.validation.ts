import { z } from "zod";

const createAppointment = z.object({
  body: z.object({
    doctorId: z.string().min(1, "Doctor Id is required!"),

    scheduleId: z.string().min(1, "Doctor schedule id is required!"),
  }),
});

export const AppointmentValidation = {
  createAppointment,
};
