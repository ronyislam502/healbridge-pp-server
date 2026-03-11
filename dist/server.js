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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
// let server: Server;
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // await prisma.$connect();
        const server = app_1.default === null || app_1.default === void 0 ? void 0 : app_1.default.listen(config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.port, () => {
            console.log(`Health-Care listening on port ${config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.port}`);
        });
    }
    catch (error) {
        console.log(error);
        // await prisma.$disconnect();
    }
});
main();
// process.on("unhandledRejection", () => {
//   console.log(`😈 unahandledRejection is detected , shutting down ...`);
//   if (server) {
//     server.close(() => {
//       process.exit(1);
//     });
//   }
//   process.exit(1);
// });
// process.on("uncaughtException", () => {
//   console.log(`😈 uncaughtException is detected , shutting down ...`);
//   process.exit(1);
// });
