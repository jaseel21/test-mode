import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Ensure this path is correct
import connectToDatabase from "@/lib/db"; // Adjust path if needed
import { NextResponse } from "next/server";
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        console.log("Session from API:", session); // Debugging session

        if (!session) {
            return NextResponse.json({ error: "Unauthorized: No session found" }, { status: 401 });
        }

        // Allowed roles
        const allowedRoles = ["Staff", "Admin", "Manager", "Super Admin"];
        if (!session.user?.role || !allowedRoles.includes(session.user.role)) {
            console.log("Access Denied: Role Not Allowed", session.user?.role);
            return NextResponse.json({ error: "Unauthorized: Insufficient role" }, { status: 403 });
        }

        await connectToDatabase();
        // const totalDonations = await Donation.countDocuments();
        // const activeBoxes = await Box.countDocuments({ status: "Active" });
        const totalDonations="40";
        const activeBoxes="32";

        return NextResponse.json({ totalDonations, activeBoxes });
    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

