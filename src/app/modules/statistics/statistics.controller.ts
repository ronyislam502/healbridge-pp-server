import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { StatisticsServices } from "./statistics.service";
import httpStatus from "http-status";

const statisticsDashboardData = catchAsync(async (req, res) => {
  const result = await StatisticsServices.statisticsDashboardDataFromDB(
    req.user
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Statistics fetch successfully",
    data: result,
  });
});

export const StatisticsControllers = {
  statisticsDashboardData,
};
