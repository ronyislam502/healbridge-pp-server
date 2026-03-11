import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type TransactionClient = Prisma.TransactionClient;

export default prisma;
