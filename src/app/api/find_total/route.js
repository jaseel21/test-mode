import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Donation from "@/models/Donation";
import Donor from "@/models/Donor";
import Volunteer from "@/models/Volunteer";
import Campaign from "@/models/Campaign";

export async function GET() {
  try {
    await dbConnect();

    // Fetch all completed donations
    const donations = await Donation.find({ status: "Completed" });

    // Fetch additional counts
    const donorCount = await Donor.countDocuments();
    const volunteerCount = await Volunteer.countDocuments();
    const activeCampaignsCount = await Campaign.countDocuments({ status: "active" });

    // Count unique boxId values
    const uniqueBoxes = await Donation.distinct("boxId");
    const totalBoxes = uniqueBoxes.filter((boxId) => boxId !== null).length;

    // Use IST for date calculations
    const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const now = new Date(new Date().getTime() + IST_OFFSET);

    // Get today's, this week's, and this month's date ranges in IST
    const today = new Date(now);
    today.setUTCHours(0, 0, 0, 0); // Start of the day in IST

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    // Compute totals
    let totalAmount = 0;
    let thisMonthAmount = 0;
    let todayAmount = 0;
    let weekAmount = 0;

    let generalTotal = 0;
    let yatheemTotal = 0;
    let sponsorYatheemTotal = 0;
    let hafizTotal = 0;
    let sponsorHafizTotal = 0;
    let buildingTotal = 0;

    donations.forEach((donation) => {
      const donationDate = new Date(donation.createdAt.getTime() + IST_OFFSET); // Convert to IST
      const amount = Number(donation.amount); // Ensure amount is a number

      if (isNaN(amount)) return; // Skip invalid amounts

      totalAmount += amount;

      if (donationDate >= startOfMonth) {
        thisMonthAmount += amount;
      }

      if (donationDate >= startOfWeek) {
        weekAmount += amount;
      }

      if (
        donationDate.getUTCFullYear() === today.getUTCFullYear() &&
        donationDate.getUTCMonth() === today.getUTCMonth() &&
        donationDate.getUTCDate() === today.getUTCDate()
      ) {
        todayAmount += amount;
      }

      switch (donation.type) {
        case "General":
          generalTotal += amount;
          break;
        case "Yatheem":
          yatheemTotal += amount; // Add to yatheemTotal
          break;
        case "Sponsor-Yatheem":
          yatheemTotal += amount; // Add to yatheemTotal
          sponsorYatheemTotal += amount; // Track Sponsor-Yatheem separately
          break;
        case "Hafiz":
          hafizTotal += amount; // Add to hafizTotal
          break;
        case "Sponsor-Hafiz":
          hafizTotal += amount; // Add to hafizTotal
          sponsorHafizTotal += amount; // Track Sponsor-Hafiz separately
          break;
        case "Building":
          buildingTotal += amount;
          break;
      }
    });

    // Return response with all computed values
    return NextResponse.json({
      totalDonations: totalAmount,
      thisMonthDonations: thisMonthAmount,
      todayDonations: todayAmount,
      weekDonations: weekAmount,
      generalTotal,
      yatheemTotal,
      sponsorYatheemTotal,
      hafizTotal,
      sponsorHafizTotal,
      buildingTotal,
      subscribersDonorCount: donorCount,
      totalVolunteers: volunteerCount,
      activeCampaigns: activeCampaignsCount,
      totalBoxes,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}