import {
  IQueryConfig,
  IQueryParams,
  IQueryResult,
  PrismaCountArgs,
  PrismaFindManyArgs,
  PrismaModelDelegate,
  PrismaStringFilter,
  PrismaWhereConditions,
} from "../interface/query.interface";
import { format } from "date-fns";

export class QueryBuilder<T> {
  private query: PrismaFindManyArgs;
  private countQuery: PrismaCountArgs;

  private page = 1;
  private limit = 10;
  private skip = 0;

  private selectFields?: Record<string, boolean>;
  
  static calculatePagination(options: IQueryParams) {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;

    return {
      page,
      limit,
      skip,
    };
  }

  constructor(
    private model: PrismaModelDelegate<T>,
    private queryParams: IQueryParams,
    private config: IQueryConfig = {}
  ) {
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10,
    };

    this.countQuery = {
      where: {},
    };
  }

  //  SEARCH (your preferred design)
  search(searchableFields: string[]): this {
    const { searchTerm } = this.queryParams;

    if (searchTerm && searchableFields?.length) {
      const searchConditions = searchableFields.map((field) => {
        const filter: PrismaStringFilter = {
          contains: searchTerm,
          mode: "insensitive",
        };

        // relation support (optional future-proof)
        if (field.includes(".")) {
          const parts = field.split(".");

          if (parts.length === 2) {
            const [relation, nestedField] = parts;

            return {
              [relation]: {
                [nestedField]: filter,
              },
            };
          }
        }

        if (field === "specialties") {
          return {
            doctorSpecialties: {
              some: {
                specialties: {
                  title: filter,
                },
              },
            },
          };
        }

        return {
          [field]: filter,
        };
      });

      (this.query.where as PrismaWhereConditions).OR = searchConditions;
      (this.countQuery.where as PrismaWhereConditions).OR = searchConditions;
    }

    return this;
  }

  //  FILTER
  filter(): this {
    const {
      searchTerm,
      page,
      limit,
      sortBy,
      sortOrder,
      fields,
      includes,
      startDate,
      endDate,
      startTime,
      endTime,
      excludeScheduleIds,
      ...filterData
    } = this.queryParams;

    const queryWhere = this.query.where as Record<string, unknown>;
    const countWhere = this.countQuery.where as Record<string, unknown>;

    // Handle excludeScheduleIds
    if (excludeScheduleIds && excludeScheduleIds.length > 0) {
      this.not({
        id: {
          in: excludeScheduleIds,
        },
      });
    }

    // Handle date and time range automatically
    if (startDate || endDate || startTime || endTime) {
      const today = format(new Date(), "yyyy-MM-dd");
      const startKey =
        this.config.startDateTimeKey ||
        this.config.dateRangeField ||
        "startDateTime";
      const endKey =
        this.config.endDateTimeKey ||
        this.config.dateRangeField ||
        "endDateTime";

      if (startDate || startTime) {
        const sDate = (startDate as string) || today;
        const timePart = startTime ? (startTime as string) : "00:00";
        const [hours, minutes] = timePart.split(":");
        const paddedTime = `${hours.padStart(2, "0")}:${minutes.padStart(
          2,
          "0"
        )}:00.000`;

        const gteValue = new Date(`${sDate}T${paddedTime}Z`);
        queryWhere[startKey] = {
          ...(queryWhere[startKey] as object),
          gte: gteValue,
        };
        countWhere[startKey] = {
          ...(countWhere[startKey] as object),
          gte: gteValue,
        };
      }

      if (endDate || endTime) {
        const eDate = (endDate as string) || today;
        let paddedTime;
        if (endTime) {
          const [hours, minutes] = (endTime as string).split(":");
          paddedTime = `${hours.padStart(2, "0")}:${minutes.padStart(
            2,
            "0"
          )}:00.000`;
        } else {
          paddedTime = "23:59:59.999";
        }

        const lteValue = new Date(`${eDate}T${paddedTime}Z`);
        queryWhere[endKey] = {
          ...(queryWhere[endKey] as object),
          lte: lteValue,
        };
        countWhere[endKey] = {
          ...(countWhere[endKey] as object),
          lte: lteValue,
        };
      }
    }

    Object.entries(filterData).forEach(([key, value]) => {
      if (
        this.config.filterableFields &&
        !this.config.filterableFields.includes(key)
      ) {
        return;
      }

      if (value === undefined || value === "") return;

      if (key === "specialties") {
        const specialtyCondition = {
          doctorSpecialties: {
            some: {
              specialties: {
                title: {
                  contains: value as string,
                  mode: "insensitive",
                },
              },
            },
          },
        };
        Object.assign(queryWhere, specialtyCondition);
        Object.assign(countWhere, specialtyCondition);
      } else {
        queryWhere[key] = this.parseValue(value);
        countWhere[key] = this.parseValue(value);
      }
    });

    return this;
  }

  //  PAGINATION
  paginate(): this {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;

    this.page = page;
    this.limit = limit;
    this.skip = (page - 1) * limit;

    this.query.skip = this.skip;
    this.query.take = this.limit;

    return this;
  }

  //  SORT
  sort(): this {
    const sortBy =
      (this.queryParams.sortBy as string) ||
      this.config.defaultSortBy ||
      "createdAt";
    const sortOrder = (this.queryParams.sortOrder as string) || "desc";

    const sortByArray = sortBy.split(",");
    const sortOrderArray = sortOrder.split(",");

    const orderBy = sortByArray.map((field, index) => ({
      [field.trim()]: sortOrderArray[index] || sortOrderArray[0] || "desc",
    }));

    this.query.orderBy = orderBy;

    return this;
  }

  //  SELECT FIELDS
  fields(): this {
    const fields = this.queryParams.fields;

    if (fields && typeof fields === "string") {
      const select: Record<string, boolean> = {};

      fields.split(",").forEach((f) => {
        select[f.trim()] = true;
      });

      this.selectFields = select;
      this.query.select = select;

      delete this.query.include;
    }

    return this;
  }

  //  SELECT (manual)
  select(select: Record<string, boolean>): this {
    this.selectFields = select;
    this.query.select = select;
    delete this.query.include;

    return this;
  }

  //  INCLUDE
  include(include: Record<string, unknown>): this {
    if (this.selectFields) return this;

    this.query.include = {
      ...(this.query.include as object),
      ...include,
    };

    return this;
  }


  //  NOT (exclude)
  not(condition: Record<string, unknown>): this {
    const queryWhere = this.query.where as any;
    const countWhere = this.countQuery.where as any;

    if (queryWhere.NOT) {
      queryWhere.NOT = { ...queryWhere.NOT, ...condition };
    } else {
      queryWhere.NOT = condition;
    }

    if (countWhere.NOT) {
      countWhere.NOT = { ...countWhere.NOT, ...condition };
    } else {
      countWhere.NOT = condition;
    }

    return this;
  }

  //  EXECUTE (DATA ONLY)
  async execute(): Promise<T[]> {
    const data = await this.model.findMany(
      this.query as PrismaFindManyArgs
    );

    return data as T[];
  }

  //  META
  async countTotal() {
    const total = await this.model.count(
      this.countQuery as PrismaCountArgs
    );

    return {
      page: this.page,
      limit: this.limit,
      total,
      totalPages: Math.ceil(total / this.limit),
    };
  }

  //  VALUE PARSER
  private parseValue(value: unknown): unknown {
    if (value === "true") return true;
    if (value === "false") return false;

    if (typeof value === "string" && !isNaN(Number(value))) {
      return Number(value);
    }

    if (Array.isArray(value)) {
      return { in: value };
    }

    if (typeof value === "object" && value !== null) {
      const parsedObj: Record<string, unknown> = {};
      Object.entries(value).forEach(([k, v]) => {
        parsedObj[k] = this.parseValue(v);
      });
      return parsedObj;
    }

    return value;
  }
}