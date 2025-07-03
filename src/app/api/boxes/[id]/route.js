import connectToDatabase from "../../../../lib/db";
import Box from "../../../../models/Box";
import { getPaymentStatus } from "../../../../lib/paymentStatus";

export async function GET(req, { params }) {
  const id = (await params).id;

  try {
    await connectToDatabase();
    const box = await Box.findById(id).lean();
    if (!box) {
      return new Response(JSON.stringify({ error: "Box not found" }), { status: 404 });
    }

    const { status, period } = getPaymentStatus(box.lastPayment);
    box.paymentStatus = status;
    if(box.lastPayment===null){
      box.paymentStatus="dead"
    }
    box.currentPeriod = period;
    
    

    return new Response(JSON.stringify(box), { status: 200 });
  } catch (error) {
    console.error("Error fetching box:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}





// import connectToDatabase from "../../../lib/db"; // Adjust path as needed
// import Box from "../../../models/Box";

// export async function GET(req, { params }) {
//   const id = (await params).id; // Unwrap params as a Promise (Next.js 15+)

//   try {
//     await connectToDatabase();
//     const box = await Box.findById(id).lean();

//     if (!box) {
//       return new Response(JSON.stringify({ error: "Box not found" }), {
//         status: 404,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     return new Response(JSON.stringify(box), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error fetching box:", error);
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }