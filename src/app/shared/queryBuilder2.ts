import { Prisma } from "@prisma/client";

class QueryBuilder2<T> {
  private modelQuery: any;
  private query: Record<string, unknown>;

  protected where: Record<string, any> = {};
  private orderBy: Prisma.Enumerable<
    Prisma.Enumerable<Record<string, "asc" | "desc">>
  > = [{ createdAt: "desc" }];
  private select?: Record<string, boolean>;
  private include?: Record<string, any>;
  private take = 10;
  private skip = 0;

  constructor(modelQuery: any, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this.query.searchTerm;

    if (typeof searchTerm !== "string" || searchableFields.length === 0) {
      return this;
    }

    this.where.OR = searchableFields.map((field) => {
      const match = field.match(/^(\w+)\.(\w+)$/);

      if (match) {
        const [, relation, relField] = match;
        return {
          [relation]: {
            [relField]: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        };
      }

      return {
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      };
    });

    return this;
  }

  filter() {
    const { AND, OR, NOT, searchTerm, sort, page, limit, fields, ...filters } =
      this.query;

    // 👉 call subclass hook for custom filtering
    this.addCustomFilters(filters);

    const operators = [
      "gte",
      "lte",
      "gt",
      "lt",
      "equals",
      "contains",
      "in",
      "startsWith",
      "endsWith",
    ];

    for (const key in filters) {
      let value: any = filters[key];
      let operator: string | null = null;

      for (const op of operators) {
        if (key.endsWith("." + op)) {
          operator = op;
          break;
        }
      }

      let path = key;
      if (operator) {
        path = key.slice(0, -(operator.length + 1));
      }

      if (typeof value === "string") {
        if (!isNaN(Date.parse(value)) && path.toLowerCase().includes("date")) {
          value = new Date(value);
        } else if (!isNaN(Number(value))) {
          value = Number(value);
        }
      }

      if (operator) {
        value = { [operator]: value };
      } else if (typeof value !== "object" || Array.isArray(value)) {
        value = { equals: value };
      }

      const parts = path.split(".");
      let current = this.where;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (i === parts.length - 1) {
          if (
            part in current &&
            typeof current[part] === "object" &&
            !Array.isArray(current[part])
          ) {
            current[part] = { ...current[part], ...value };
          } else {
            current[part] = value;
          }
        } else {
          if (!(part in current) || typeof current[part] !== "object") {
            current[part] = {};
          }
          current = current[part];
        }
      }
    }

    if (AND) this.where.AND = AND;
    if (OR)
      this.where.OR = [...((this.where.OR as any[]) || []), ...(OR as any[])];
    if (NOT) this.where.NOT = NOT;

    return this;
  }

  // ✅ You can override this in a subclass
  protected addCustomFilters(filters: Record<string, any>) {}

  sort() {
    if (typeof this.query.sort === "string") {
      this.orderBy = this.query.sort.split(",").map((field) => {
        if (field.startsWith("-")) {
          return { [field.substring(1)]: "desc" as const };
        } else {
          return { [field]: "asc" as const };
        }
      });
    } else {
      this.orderBy = [{ createdAt: "desc" }];
    }
    return this;
  }

  fields() {
    const fields = this.query.fields;
    if (typeof fields === "string") {
      const fieldArr = fields.split(",").map((f) => f.trim());
      this.select = Object.fromEntries(fieldArr.map((f) => [f, true]));
    }
    return this;
  }

  paginate() {
    const pageRaw = this.query.page;
    const limitRaw = this.query.limit;

    const page = typeof pageRaw === "string" ? parseInt(pageRaw) : 1;
    const limit = typeof limitRaw === "string" ? parseInt(limitRaw) : 10;

    this.skip = (page - 1) * limit;
    this.take = limit;
    return this;
  }

  async countTotal() {
    const total = await this.modelQuery.count({ where: this.where });
    const page =
      typeof this.query.page === "string" ? parseInt(this.query.page) : 1;
    const limit =
      typeof this.query.limit === "string" ? parseInt(this.query.limit) : 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }

  setSelect(fields: Record<string, boolean>) {
    this.select = fields;
    return this;
  }

  setInclude(include: Record<string, any>) {
    this.include = include;
    return this;
  }

  async execute() {
    return this.modelQuery.findMany({
      where: this.where,
      orderBy: this.orderBy,
      select: this.select,
      include: this.include,
      skip: this.skip,
      take: this.take,
    });
  }
}

export default QueryBuilder2;
