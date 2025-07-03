// src/app/api/campaigns/[id]/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import Campaign from "../../../../models/Campaign";

// src/app/api/campaigns/[id]/route.js (partial update)
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    const campaign = await Campaign.findById(id).lean();
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.featuredImage) {
      const base64Image = Buffer.from(campaign.featuredImage.buffer).toString("base64");
      campaign.featuredImage = `data:${campaign.featuredImageType || "image/jpeg"};base64,${base64Image}`;
    }

    // Ensure category is included
    campaign.category = campaign.category || "";

    console.log("Fetched campaign:", campaign);
    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json({ error: "Failed to fetch campaign", details: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const formData = await request.formData();

    const updateData = {
      name: formData.get("name"),
      type: formData.get("type"),
      category: formData.get("category"),
      goal: formData.get("goal") ? parseInt(formData.get("goal")) : undefined,
      area: formData.get("area") || undefined,
      rate: formData.get("rate") ? parseInt(formData.get("rate")) : undefined,
      isInfinite: formData.get("isInfinite") === "true",
      description: formData.get("description"),
      startDate: new Date(formData.get("startDate")),
      endDate: new Date(formData.get("endDate")),
      targetAudience: formData.get("targetAudience") || "",
      notes: formData.get("notes") || "",
      status: formData.get("status"),
      currentAmount: parseInt(formData.get("currentAmount") || "0"),
    };

    if (formData.get("featuredImage")) {
      const file = formData.get("featuredImage");
      updateData.featuredImage = Buffer.from(await file.arrayBuffer());
      updateData.featuredImageType = file.type;
    }

    const campaign = await Campaign.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Campaign updated successfully", campaign });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json({ error: "Failed to update campaign", details: error.message }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false, // Required for formData handling in PUT
  },
};









// // src/app/api/campaigns/admin/[id]/route.js
// import { NextResponse } from "next/server";
// import connectToDatabase from "../../../../lib/db";
// import Campaign from "../../../../models/Campaign";

// export async function GET(request, { params }) {
//   try {
//     // Await the params Promise to get the actual params object
//     const resolvedParams = await params;
//     await connectToDatabase();
//     const campaign = await Campaign.findById(resolvedParams.id).lean();
//     if (!campaign) {
//       return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
//     }
//     return NextResponse.json(campaign);
//   } catch (error) {
//     console.error("Error fetching campaign:", error);
//     return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
//   }
// }

// export async function PUT(request, { params }) {
//   try {
//     // Await the params Promise to get the actual params object
//     const resolvedParams = await params;
//     await connectToDatabase();
//     const formData = await request.formData();

//     const updateData = {
//       name: formData.get("name"),
//       type: formData.get("type"),
//       category: formData.get("category"),
//       goal: formData.get("goal") ? parseInt(formData.get("goal")) : undefined,
//       area: formData.get("area") || undefined,
//       rate: formData.get("rate") ? parseInt(formData.get("rate")) : undefined,
//       isInfinite: formData.get("isInfinite") === "true",
//       description: formData.get("description"),
//       startDate: new Date(formData.get("startDate")),
//       endDate: new Date(formData.get("endDate")),
//       targetAudience: formData.get("targetAudience") || "",
//       notes: formData.get("notes") || "",
//       status: formData.get("status"),
//       currentAmount: parseInt(formData.get("currentAmount") || "0"),
//     };

//     if (formData.get("featuredImage")) {
//       const file = formData.get("featuredImage");
//       updateData.featuredImage = Buffer.from(await file.arrayBuffer());
//       updateData.featuredImageType = file.type;
//     }

//     const campaign = await Campaign.findByIdAndUpdate(
//       resolvedParams.id,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     if (!campaign) {
//       return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Campaign updated successfully" });
//   } catch (error) {
//     console.error("Error updating campaign:", error);
//     return NextResponse.json({ error: "Failed to update campaign", details: error.message }, { status: 500 });
//   }
// }

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };