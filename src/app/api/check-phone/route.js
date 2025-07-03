import connectToDatabase from "../../../lib/db";
import Admin from "../../../models/Admin";
import Volunteer from "../../../models/Volunteer";
// import User from "../../../models/User";
import Box from "../../../models/Box"
import Donor from "@/models/Donor";
import { NextResponse } from "next/server";

// Define role-to-model mapping
const roleModelMap = {
    "Super Admin": Admin,  
    "Manager": Admin,      
    "Admin": Admin,       
    "Staff": Admin,
    "Subscriber":Donor,        
    "Volunteer": Volunteer,
    "BoxHolder": Box,
  };
  

// Handle POST requests
export async function POST(req) {
  console.log("🔹 Received request at /api/check-phone");

  try {
    // Parse request body
    const body = await req.json();
    let { phone, role } = body;


    

    console.log("🔹 Checking phone:", phone, "for role:", role);

    // Validate input
    if (!phone || !role) {
      return NextResponse.json(
        { message: "Phone number and role are required", exists: false },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Get the correct model for the given role
    const Model = roleModelMap[role];

    if (!Model) {
      return NextResponse.json(
        { message: "Invalid role provided", exists: false },
        { status: 400 }
      );
    }

    // Check if phone number exists in the corresponding model
    phone = phone.replace(/\s|-/g, "");

    // Check if the phone number already has a country code (starts with '+')
    if (!phone.startsWith("+")) {
      phone = "+91" + phone; // Add country code if missing
    }
    
    // Log the updated phone number
    console.log(phone); 
    const user = await Model.findOne({ phone });
    console.log(user);
    

    if (!user) {
      return NextResponse.json(
        { message: `Phone number not found in ${role} collection`, exists: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Phone number exists", exists: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("🔥 Server Error:", error);
    return NextResponse.json(
      { message: "Internal server error", exists: false },
      { status: 500 }
    );
  }
}
