"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
class QueryBuilder2 {
    constructor(modelQuery, query) {
        this.where = {};
        this.orderBy = [{ createdAt: "desc" }];
        this.take = 10;
        this.skip = 0;
        this.modelQuery = modelQuery;
        this.query = query;
    }
    search(searchableFields) {
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
        const _a = this.query, { AND, OR, NOT, searchTerm, sort, page, limit, fields } = _a, filters = __rest(_a, ["AND", "OR", "NOT", "searchTerm", "sort", "page", "limit", "fields"]);
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
            let value = filters[key];
            let operator = null;
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
                }
                else if (!isNaN(Number(value))) {
                    value = Number(value);
                }
            }
            if (operator) {
                value = { [operator]: value };
            }
            else if (typeof value !== "object" || Array.isArray(value)) {
                value = { equals: value };
            }
            const parts = path.split(".");
            let current = this.where;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (i === parts.length - 1) {
                    if (part in current &&
                        typeof current[part] === "object" &&
                        !Array.isArray(current[part])) {
                        current[part] = Object.assign(Object.assign({}, current[part]), value);
                    }
                    else {
                        current[part] = value;
                    }
                }
                else {
                    if (!(part in current) || typeof current[part] !== "object") {
                        current[part] = {};
                    }
                    current = current[part];
                }
            }
        }
        if (AND)
            this.where.AND = AND;
        if (OR)
            this.where.OR = [...(this.where.OR || []), ...OR];
        if (NOT)
            this.where.NOT = NOT;
        return this;
    }
    // ✅ You can override this in a subclass
    addCustomFilters(filters) { }
    sort() {
        if (typeof this.query.sort === "string") {
            this.orderBy = this.query.sort.split(",").map((field) => {
                if (field.startsWith("-")) {
                    return { [field.substring(1)]: "desc" };
                }
                else {
                    return { [field]: "asc" };
                }
            });
        }
        else {
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
    countTotal() {
        return __awaiter(this, void 0, void 0, function* () {
            const total = yield this.modelQuery.count({ where: this.where });
            const page = typeof this.query.page === "string" ? parseInt(this.query.page) : 1;
            const limit = typeof this.query.limit === "string" ? parseInt(this.query.limit) : 10;
            const totalPage = Math.ceil(total / limit);
            return {
                page,
                limit,
                total,
                totalPage,
            };
        });
    }
    setSelect(fields) {
        this.select = fields;
        return this;
    }
    setInclude(include) {
        this.include = include;
        return this;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.modelQuery.findMany({
                where: this.where,
                orderBy: this.orderBy,
                select: this.select,
                include: this.include,
                skip: this.skip,
                take: this.take,
            });
        });
    }
}
exports.default = QueryBuilder2;
