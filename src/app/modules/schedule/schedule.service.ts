import { addHours, addMinutes, format } from "date-fns";
import { TSchedule } from "./schedule.interface";
import prisma from "../../shared/prisma";
import { Schedule } from "@prisma/client";
import HealthQueryBuilder from "../../builder/healthQuery";
import { convertDateTime } from "../../shared/convertTime";
import { JwtPayload } from "jsonwebtoken";

const createScheduleIntoDB = async (
  payload: TSchedule
): Promise<Schedule[]> => {
  const schedules = [];
  const intervalTime = 30;
  const currentDate = new Date(payload?.startDate);
  const endDate = new Date(payload?.endDate);

  while (currentDate <= endDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(payload?.startTime.split(":")[0])
        ),
        Number(payload?.startTime.split(":")[1])
      )
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(payload?.endTime.split(":")[0])
        ),
        Number(payload?.endTime.split(":")[1])
      )
    );
    while (startDateTime < endDateTime) {
      // const scheduleData = {
      //   startDateTime: startDateTime,
      //   endDateTime: addMinutes(startDateTime, intervalTime),
      // };

      const s = await convertDateTime(startDateTime);
      const e = await convertDateTime(addMinutes(startDateTime, intervalTime));

      const scheduleData = {
        startDateTime: s,
        endDateTime: e,
      };

      const isScheduleExist = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData?.startDateTime,
          endDateTime: scheduleData?.endDateTime,
        },
      });

      if (!isScheduleExist) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }

      startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedules;
};

const getAllSchedulesFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>
) => {
  const isDoctorSchedule = await prisma.doctorSchedules.findMany({
    where: {
      doctor: {
        email: user.email,
      },
    },
  });

  const doctorScheduleIds = isDoctorSchedule.map(
    (schedule) => schedule.scheduleId
  );

  const updatedQuery = {
    ...query,
    excludeScheduleIds: doctorScheduleIds,
  };

  const scheduleQuery = new HealthQueryBuilder(prisma.schedule, updatedQuery)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await scheduleQuery.countTotal();
  const data = await scheduleQuery.execute();

  return { meta, data };
};

const getSingleScheduleFromDB = async (
  id: string
): Promise<Schedule | null> => {
  const result = await prisma.schedule.findUnique({
    where: {
      id,
    },
  });

  return result;
};

const deleteScheduleFromDB = async (id: string): Promise<Schedule> => {
  const result = await prisma.schedule.delete({
    where: {
      id,
    },
  });

  return result;
};

export const ScheduleServices = {
  createScheduleIntoDB,
  getAllSchedulesFromDB,
  getSingleScheduleFromDB,
  deleteScheduleFromDB,
};
