import connectToDatabase from "@/lib/db";
import Box from "@/models/Box";
import twilio from "twilio";
// import { getPaymentStatus } from "../../../../../lib/paymentStatus";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req, { params }) {
  const id = (await params).id;
  const { amount } = await req.json();

  const paymentDate=new Date()

  try {
    await connectToDatabase();
    const box = await Box.findById(id);
    if (!box) {
      return new Response(JSON.stringify({ error: "Box not found" }), { status: 404 });
    }

    if (!box.isActive) {
      box.isActive = true;
    }

    box.lastPayment = paymentDate ? new Date(paymentDate) : new Date();
    box.updatedAt = new Date();
    await box.save();

    // const period = getPaymentStatus(box.lastPayment).period;
    
    const holderName = box.name;

    const now = new Date();

// Format Date (DD-MM-YYYY)
const date = now.toLocaleDateString('en-IN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

// Format Time (HH:MM AM/PM)
const time = now.toLocaleTimeString('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true  // Ensures 12-hour format with AM/PM
});


    // const message = `Dear *${holderName}*, your box  *${box.serialNumber}* has been successfully collected by Akode Islamic Centre during *${period}*. The amount collected is *₹${amount}*. May Allah accept your generous contribution. Thank you for your kindness and support`;
    const message = `
📜 *Payment Receipt*  

Dear *${holderName}*,  

Your donation box (*${box.serialNumber}*) has been successfully collected by *Akode Islamic Centre*.  

💰 *Amount Collected:* ₹${amount}  

May Allah accept your generosity. Thank you for your support!  

📅 *Date:* ${date}  
⏰ *Time:* ${time}  

Best regards,  
*Akode Islamic Centre*
`;

try{
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_WHATSAPP_NUMBER, // Your Twilio WhatsApp number
    // to: `whatsapp:${box.phone}`,
    to: `whatsapp:${box.phone}`,
  });
}catch{
  console.log("twilio not enabled");
  
}

    

    return new Response(JSON.stringify({ message: "Payment recorded", box }), { status: 200 });
  } catch (error) {
    console.error("Error recording payment:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
