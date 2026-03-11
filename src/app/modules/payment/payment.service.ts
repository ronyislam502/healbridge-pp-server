import prisma from "../../shared/prisma";
import { initialPayment } from "./payment.utils";
import { PaymentStatus } from "@prisma/client";

const createPaymentIntoDB = async (appointmentId: string) => {
  const isPayment = await prisma.payment.findFirstOrThrow({
    where: {
      appointmentId,
    },
    include: {
      appointment: {
        include: {
          patient: true,
        },
      },
    },
  });

  //   console.log("is", isPayment);

  const paymentData = {
    amount: isPayment?.amount,
    transactionId: isPayment?.transactionId,
    name: isPayment?.appointment?.patient?.name,
    email: isPayment?.appointment?.patient?.email,
    address: isPayment?.appointment?.patient?.address,
    phone: isPayment?.appointment?.patient?.phone,
  };

  const result = await initialPayment(paymentData);

  return result;
};

const validatePaymentFromDB = async (payload: any) => {
  // if your server has production then use this uncomment but development purpose use local then comment

  // if (!payload || !payload.status || !(payload.status === 'VALID')) {
  //     return {
  //         message: "Invalid Payment!"
  //     }
  // }

  // const response = await SSLService.validatePayment(payload);

  // if (response?.status !== 'VALID') {
  //     return {
  //         message: "Payment Failed!"
  //     }
  // }

  // ----------------++++--------------//

  const response = payload; // const response = payload; (if local server use development purpose then uncomment)

  await prisma.$transaction(async (tx) => {
    const updatedPaymentData = await tx.payment.update({
      where: {
        transactionId: response.tran_id,
      },
      data: {
        status: PaymentStatus.PAID,
        paymentGatewayData: response,
      },
    });
    await tx.appointment.update({
      where: {
        id: updatedPaymentData.appointmentId,
      },
      data: {
        paymentStatus: PaymentStatus.PAID,
      },
    });
  });

  return {
    message: "payment success",
  };
};

export const PaymentServices = {
  createPaymentIntoDB,
  validatePaymentFromDB,
};
