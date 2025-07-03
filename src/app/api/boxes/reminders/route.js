import connectToDatabase from "@/lib/db";
import Box from "@/models/Box";
import { getPaymentStatus } from "@/lib/paymentStatus";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function GET() {
  try {
    await connectToDatabase();
    const boxes = await Box.find().lean();
    const now = new Date();
    // const oneWeek = 7 * 24 * 60 * 60 * 1000;

    console.log("Checking boxes for reminders...");

    for (const box of boxes) {
      const { status, period, end } = getPaymentStatus(box.lastPayment);
      const daysToEnd = (end - now) / (24 * 60 * 60 * 1000);

      console.log(`Box ${box.serialNumber}: Status=${status}, Period=${period}, Days Left=${daysToEnd}`);

      if (daysToEnd <= 7 && daysToEnd >= 0 && status === "Pending") {
        const formattedNumber = box.mobileNumber.startsWith("+") ? box.mobileNumber : `+91${box.mobileNumber}`;
        const message = `Reminder: Please pay for your box (${box.serialNumber}) for ${period}. Only ${Math.ceil(daysToEnd)} days left!`;
        console.log(`Sending to ${formattedNumber}: ${message}`);

        await client.messages.create({
          body: message,
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: `whatsapp:${formattedNumber}`,
        });
        console.log(`Message sent to ${formattedNumber}`);
      } else {
        console.log(`No reminder needed for ${box.serialNumber}`);
      }
    }

    return new Response(JSON.stringify({ message: "Reminders sent" }), { status: 200 });
  } catch (error) {
    console.error("Error sending reminders:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}