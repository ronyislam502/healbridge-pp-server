import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PaymentServices } from "./payment.service";
import config from "../../config";
import { stripe } from "../../shared/stripe";


const handleStripeWebhookEvent = catchAsync(async (req,  res) => {

    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = config.stripe_webhook_secret as string;

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    const result = await PaymentServices.handleStripeWebhookEvent(event);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Webhook req send successfully',
        data: result,
    });
});

export const PaymentController = {
    handleStripeWebhookEvent
}