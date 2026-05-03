import { z } from "zod";

const createSchedule = z.object({
  body: z.object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  }),
});

export const ScheduleValidations = {
  createSchedule,
};
