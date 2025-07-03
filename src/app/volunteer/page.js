// src/app/volunteer/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import connectToDatabase from "../../lib/db";
import Volunteer from "../../models/Volunteer";

export default async function VolunteerPage() {
  const session = await getServerSession(authOptions);

  // Redirect if no session exists
  if (!session) {
    redirect("/auth/volunteer/sign-in");
  }

  // Connect to database
  await connectToDatabase();

  // Get volunteer document using phone number from session
  const volunteer = await Volunteer.findOne({ 
    phone: session.user.phone
  });

  // Redirect if volunteer not found or role isn't Volunteer
  if (!volunteer || session.user.role !== "Volunteer") {
    redirect("/auth/volunteer/sign-in");
  }

  // Handle pending or rejected status
  if (volunteer.status === "pending") {
    redirect("/volunteer/pending");
  } else if (volunteer.status === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h1 className="text-3xl font-bold text-red-600">Your Volunteer Application Has Been Rejected</h1>
      </div>
    );
  }

  // const stats = [
  //   { label: "Total Boxes Added", value: volunteer.boxesAdded || 0, color: "blue" },
  //   { label: "Collections This Month", value: volunteer.collectionsThisMonth || 0, color: "green" },
  //   { label: "Collection Success Rate", value: `${volunteer.successRate || 98}%`, color: "purple" },
  //   { label: "Days Active", value: volunteer.daysActive || 45, color: "orange" },
  // ];

  // Render dashboard for approved volunteers
  return (
    <>
      <main className="bg-gray-50 min-h-screen pb-12">
        {/* Hero Section with Greeting */}
        <div className="bg-gradient-to-b from-blue-500 to-blue-600 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Welcome to Your Dashboard</h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Thank you for your dedication to serving our community. Your volunteer work makes a significant impact.
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        {/* <div className="max-w-6xl mx-auto px-4 -mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:shadow-lg">
                <div className={`text-${stat.color}-500 text-xl font-bold mb-1`}>{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/volunteer/add-box" className="group">
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-t-4 border-blue-500 h-full">
                <div className="text-blue-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0l-8 4m-8-4l8 4m0 0v6"></path>
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 mb-2">
                  Add New Box
                </h2>
                <p className="text-gray-500 text-sm">Register a new donation box for tracking and collection</p>
              </div>
            </Link>

            <Link href="/volunteer/collect-box" className="group">
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-t-4 border-green-500 h-full">
                <div className="text-green-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8m-4-4h8m-8 0H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v4a2 2 0 01-2 2h-4"></path>
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 mb-2">
                  Collect Box
                </h2>
                <p className="text-gray-500 text-sm">Record a collection and update donation information</p>
              </div>
            </Link>

            <Link href="/volunteer/history" className="group">
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-t-4 border-purple-500 h-full">
                <div className="text-purple-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 mb-2">
                  History
                </h2>
                <p className="text-gray-500 text-sm">View your complete activity history and contribution records</p>
              </div>
            </Link>

            <Link href="/volunteer/profile" className="group">
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-t-4 border-orange-500 h-full">
                <div className="text-orange-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 mb-2">
                  Profile
                </h2>
                <p className="text-gray-500 text-sm">Manage your volunteer profile and personal information</p>
              </div>
            </Link>
          </div>
          
          {/* Recent Activity Section (Optional) */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
              <Link href="/volunteer/history" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Placeholder for recent activity - replace with actual data */}
              <div className="divide-y divide-gray-200">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start">
                      <div className={`rounded-full w-8 h-8 flex items-center justify-center ${item === 1 ? 'bg-blue-100 text-blue-600' : item === 2 ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item === 1 ? "M20 7l-8-4-8 4m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0l-8 4m-8-4l8 4" : item === 2 ? "M12 8v8m-4-4h8" : "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"} />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {item === 1 ? 'Added new box #12345' : item === 2 ? 'Collected ₹2,500 from box #10032' : 'Updated profile information'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item === 1 ? '2 hours ago' : item === 2 ? 'Yesterday at 4:30 PM' : '3 days ago'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Volunteer Portal</h3>
            <p className="text-gray-400 text-sm">
              Making a difference in our community through dedicated volunteer service.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/volunteer/add-box" className="hover:text-white transition-colors">Add Box</Link></li>
              <li><Link href="/volunteer/collect-box" className="hover:text-white transition-colors">Collect Box</Link></li>
              <li><Link href="/volunteer/history" className="hover:text-white transition-colors">History</Link></li>
              <li><Link href="/volunteer/profile" className="hover:text-white transition-colors">Profile</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>© 2025 Volunteer Portal. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}