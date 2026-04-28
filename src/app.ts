import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./app/routes";
import notFound from "./app/middlewares/notFound";


const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

//parser
app.use(express.urlencoded({ extended: true }));

const getController = (req: Request, res: Response) => {
  res.send("Health Care app");
};

app.get("/", getController);

app.use("/api/v1", router);

app.use(globalErrorHandler);

app.use(notFound);

export default app;
