// src/app/api/subscriptions/[id]/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import Subscription from "../../../../models/Subscription";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const subscription = await Subscription.findById(params.id).lean();
    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }
    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const subscription = await Subscription.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }
    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const subscription = await Subscription.findByIdAndDelete(params.id);
    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}