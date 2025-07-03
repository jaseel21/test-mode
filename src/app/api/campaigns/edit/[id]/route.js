import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Campaign from "@/models/Campaign";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const campaign = await Campaign.findById(params.id).lean();
    console.log("Fetched campaign from DB:", campaign);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const formData = await request.formData();

    const updateData = {
      name: formData.get("name"),
      type: formData.get("type"),
      goal: formData.get("goal") ? parseInt(formData.get("goal")) : undefined,
      area: formData.get("area") || undefined,
      rate: formData.get("rate") ? parseInt(formData.get("rate")) : undefined,
      isInfinite: formData.get("isInfinite") === "true",
      description: formData.get("description"),
      startDate: new Date(formData.get("startDate")),
      endDate: new Date(formData.get("endDate")),
      notes: formData.get("notes"),
      status: formData.get("status"),
      currentAmount: parseInt(formData.get("currentAmount") || "0"),
    };

    if (updateData.isInfinite) {
      updateData.goal = undefined; // Clear goal if infinite
    }

    if (updateData.type !== "fixedamount") {
      updateData.area = undefined;
      updateData.rate = undefined;
    }

    if (formData.get("featuredImage")) {
      const file = formData.get("featuredImage");
      updateData.featuredImage = Buffer.from(await file.arrayBuffer());
      updateData.featuredImageType = file.type;
    }

    const campaign = await Campaign.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    console.log("Updated campaign:", campaign);
    return NextResponse.json({ message: "Campaign updated successfully" });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}