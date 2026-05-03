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
    const excluded = [
      "searchTerm",
      "page",
      "limit",
      "sortBy",
      "sortOrder",
      "fields",
      "includes",
    ];

    const queryWhere = this.query.where as Record<string, unknown>;
    const countWhere = this.countQuery.where as Record<string, unknown>;

    Object.entries(this.queryParams).forEach(([key, value]) => {
      if (excluded.includes(key) || value === undefined || value === "")
        return;

      queryWhere[key] = this.parseValue(value);
      countWhere[key] = this.parseValue(value);
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
    const sortBy = this.queryParams.sortBy || "createdAt";
    const sortOrder =
      this.queryParams.sortOrder === "asc" ? "asc" : "desc";

    this.query.orderBy = {
      [sortBy]: sortOrder,
    };

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

  //  INCLUDE
  include(include: Record<string, unknown>): this {
    if (this.selectFields) return this;

    this.query.include = {
      ...(this.query.include as object),
      ...include,
    };

    return this;
  }

  //  WHERE (manual)
  where(condition: Record<string, unknown>): this {
    this.query.where = {
      ...(this.query.where as object),
      ...condition,
    };

    this.countQuery.where = {
      ...(this.countQuery.where as object),
      ...condition,
    };

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

    return value;
  }
}