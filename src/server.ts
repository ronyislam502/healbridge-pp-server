import { Server } from "http";
import app from "./app";
import config from "./app/config";
import prisma from "./app/shared/prisma";

let server: Server;

const main = async () => {
  try {
    await prisma.$connect();
    server = app?.listen(config?.port, () => {
      console.log(`Health-Care listening on port ${config?.port}`);
    });
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
  }
};

main();

process.on("unhandledRejection", () => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
