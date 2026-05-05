import Stripe from "stripe";
import { PaymentStatus } from "@prisma/client";
import prisma from "../../shared/prisma";

const handleStripeWebhookEvent = async (event: any) => {
  switch (event.type) {

    /**
     * ✅ PAYMENT SUCCESS
     */
    case "checkout.session.completed": {
      const session = event.data.object as any;

      const appointmentId = session.metadata?.appointmentId;
      const paymentId = session.metadata?.paymentId;

      const isPaid = session.payment_status === "paid";

      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          paymentStatus: isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID,
        },
      });

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID,
          paymentGatewayData: session,
        },
      });

      break;
    }

    /**
     * ❌ PAYMENT FAILED
     */
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as any;

      const appointmentId = paymentIntent.metadata?.appointmentId;
      const paymentId = paymentIntent.metadata?.paymentId;

      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          paymentStatus: PaymentStatus.FAILED,
        },
      });

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.FAILED,
          paymentGatewayData: paymentIntent,
        },
      });

      break;
    }

    /**
     * ❌ USER CANCEL (Checkout not completed)
     */
    case "checkout.session.expired": {
      const session = event.data.object as any;

      const appointmentId = session.metadata?.appointmentId;
      const paymentId = session.metadata?.paymentId;

      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          paymentStatus: PaymentStatus.CANCELLED,
        },
      });

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.CANCELLED,
          paymentGatewayData: session,
        },
      });

      break;
    }

    /**
     * 💸 REFUND
     */
    case "charge.refunded": {
      const charge = event.data.object as any;

      const paymentIntent = charge.payment_intent;

      // optional: তুমি আগে paymentIntent দিয়ে payment খুঁজতে পারো
      const payment = await prisma.payment.findFirst({
        where: {
          transactionId: paymentIntent,
        },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.REFUNDED,
            paymentGatewayData: charge,
          },
        });

        await prisma.appointment.update({
          where: { id: payment.appointmentId },
          data: {
            paymentStatus: PaymentStatus.REFUNDED,
          },
        });
      }

      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }
};

export const PaymentServices = {
    handleStripeWebhookEvent
}