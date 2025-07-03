import mongoose from 'mongoose';
import Donation from '@/models/Donation'; // Adjust the path as needed

export async function GET() {
  try {
    // Connect to MongoDB (ensure you have this set up)
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Fetch recent donations, limit to 50 and sort by createdAt descending
    const donations = await Donation.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return new Response(JSON.stringify({ success: true, donations }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}