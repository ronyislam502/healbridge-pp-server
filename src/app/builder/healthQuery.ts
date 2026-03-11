import QueryBuilder from "./queryBuilder";

class HealthQueryBuilder<T> extends QueryBuilder<T> {
  protected addCustomFilters(filters: Record<string, any>) {
    // if (filters.doctorEmail) {
    //   this.where.doctor = {
    //     ...(this.where.doctor || {}),
    //     email: {
    //       contains: filters.doctorEmail,
    //       mode: "insensitive",
    //     },
    //   };
    //   delete filters.doctorEmail;
    // }

    if (
      filters.excludeScheduleIds &&
      Array.isArray(filters.excludeScheduleIds)
    ) {
      this.where.id = {
        notIn: filters.excludeScheduleIds,
      };
      delete filters.excludeScheduleIds;
    }

    // const andConditions = this.where.AND || [];

    if (filters.startDate && filters.endDate) {
      const startTime = filters.startTime || "00:00";
      const endTime = filters.endTime || "23:59";

      const startDateTime = new Date(
        `${filters.startDate}T${startTime}:00+06:00`
      );
      const endDateTime = new Date(`${filters.endDate}T${endTime}:00+06:00`);

      this.where.AND = [
        { startDateTime: { gte: startDateTime } },
        { endDateTime: { lte: endDateTime } },
      ];
      // andConditions.push(
      //   { startDateTime: { gte: startDateTime } },
      //   { endDateTime: { lte: endDateTime } }
      // );

      delete filters.startDate;
      delete filters.endDate;
      delete filters.startTime;
      delete filters.endTime;
    }

    if (filters.startDate && !filters.endDate) {
      const startDateTime = new Date(`${filters.startDate}T00:00:00+06:00`);
      const endDateTime = new Date(`${filters.startDate}T23:59:59+06:00`);

      this.where.AND = [
        { startDateTime: { gte: startDateTime } },
        { endDateTime: { lte: endDateTime } },
      ];

      // andConditions.push(
      //   { startDateTime: { gte: startDateTime } },
      //   { endDateTime: { lte: endDateTime } }
      // );

      delete filters.startDate;
    }
  }
}

export default HealthQueryBuilder;
