import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./app/routes";
import cron from "node-cron";
import notFound from "./app/middlewares/notFound";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { AppointmentServices } from "./app/modules/appointment/appointment.service";
import { PaymentController } from "./app/modules/payment/payment.controller";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

//parser
app.use(express.urlencoded({ extended: true }));

app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    PaymentController.handleStripeWebhookEvent
);

cron.schedule("* * * * *", () => {
  try {
    AppointmentServices.cancelUnPaidAppointments();
  } catch (err) {
    console.error(err);
  }
});

const getController = (req: Request, res: Response) => {
  res.send("Health Care app");
};

app.get("/", getController);

app.use("/api/v1", router);

app.use(globalErrorHandler);

app.use(notFound);

export default app;
