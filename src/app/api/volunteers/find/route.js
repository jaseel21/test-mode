import { NextResponse } from "next/server";
import  connectToDatabase  from "../../../../lib/db";
import Volunteer from "../../../../models/Volunteer";

export async function GET() {
  await connectToDatabase();
  const volunteers = await Volunteer.find({ role: "Volunteer" });
  return NextResponse.json(volunteers);
}