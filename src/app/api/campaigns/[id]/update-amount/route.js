import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../lib/db";
import Campaign from "../../../../../models/Campaign";

export async function PATCH(request, context) {
  try {
    const id = context.params.id;
    await connectToDatabase();
    const { amount } = await request.json();

    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      id,
      { $inc: { currentAmount: numericAmount } },
      { new: true, runValidators: true }
    );

    if (!updatedCampaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error("Error updating campaign amount:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}