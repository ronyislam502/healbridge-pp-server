/* eslint-disable @typescript-eslint/no-explicit-any */

import { TMeta } from "../shared/sendResponse";

export interface PrismaFindManyArgs {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, boolean | Record<string, unknown>>;
  orderBy?: Record<string, unknown>;
  skip?: number;
  take?: number;
}

export interface PrismaCountArgs {
  where?: Record<string, unknown>;
}

export interface PrismaModelDelegate<T = any> {
  findMany(args?: PrismaFindManyArgs): Promise<T[]>;
  count(args?: PrismaCountArgs): Promise<number>;
}

export interface IQueryParams {
  searchTerm?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  fields?: string;
  includes?: string;

  //  flexible query support
  [key: string]:
    | string
    | string[]
    | number
    | boolean
    | Record<string, unknown>
    | undefined;
}

export interface IQueryConfig {
  searchableFields?: string[];
  filterableFields?: string[];
}

export interface PrismaStringFilter {
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  mode?: 'insensitive' | 'default';
  equals?: string;
  in?: string[];
  notIn?: string[];
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
  not?: PrismaStringFilter | string;
}

export interface PrismaNumberFilter {
  equals?: number;
  in?: number[];
  notIn?: number[];
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  not?: PrismaNumberFilter | number;
}


export interface PrismaWhereConditions {
  OR?: Record<string, unknown>[];
  AND?: Record<string, unknown>[];
  NOT?: Record<string, unknown>[];
  [key: string]: unknown;
}

export interface IQueryResult<T>{
    data : T[];
    meta : TMeta
}