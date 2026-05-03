import { Schedule } from "@prisma/client";
import { addMinutes, format } from "date-fns";
import prisma from "../../shared/prisma";
import { ISchedule } from "./schedule.interface";
import { IQueryParams } from "../../interface/query.interface";
import { QueryBuilder } from "../../builder/queryBuilder";

const createScheduleIntoDB = async (payload: ISchedule): Promise<Schedule[]> => {
    const { startDate, endDate, startTime, endTime } = payload;

    const intervalTime = 30;
    const schedules = [];

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    while (startDateTime <= endDateTime) {
        let currentStartTime = new Date(
            `${format(startDateTime, 'yyyy-MM-dd')}T${startTime}`
        );

        let currentEndTime = new Date(
            `${format(startDateTime, 'yyyy-MM-dd')}T${endTime}`
        );

        while (currentStartTime < currentEndTime) {
            const scheduleData = {
                startDateTime: currentStartTime,
                endDateTime: addMinutes(currentStartTime, intervalTime)
            };

            const existingSchedule = await prisma.schedule.findFirst({
                where: {
                    startDateTime: scheduleData.startDateTime,
                    endDateTime: scheduleData.endDateTime
                }
            });

            if (!existingSchedule) {
                const result = await prisma.schedule.create({
                    data: scheduleData
                });
                schedules.push(result);
            }

            currentStartTime = addMinutes(currentStartTime, intervalTime);
        }

        startDateTime.setDate(startDateTime.getDate() + 1);
    }

    return schedules;
};

const getAllSchedulesFromDB = async (
    options: IQueryParams
) => {
    const scheduleQuery = new QueryBuilder<Schedule>(prisma.schedule, options)
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await scheduleQuery.execute();
    const meta = await scheduleQuery.countTotal();

    return {
        meta,
        data: result
    };
};

const deleteScheduleFromDB = async (id: string): Promise<Schedule> => {
    const result = await prisma.schedule.delete({
        where: {
            id
        }
    });
    return result;
};

export const ScheduleServices = {
    createScheduleIntoDB,
    getAllSchedulesFromDB,
    deleteScheduleFromDB
};
