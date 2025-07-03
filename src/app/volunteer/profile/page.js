import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "Volunteer") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const { name, email, role, phone } = session.user;
  const initial = name ? name[0].toUpperCase() : "V";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center">
          <div className="inline-flex justify-center items-center w-24 h-24 rounded-full bg-white text-blue-600 text-3xl font-bold shadow-md border-4 border-white mb-3">
            {initial}
          </div>
          <h1 className="text-xl font-bold text-white mt-3">
            {name || "Volunteer Profile"}
          </h1>
          <span className="inline-block bg-blue-500 text-blue-100 text-sm px-3 py-1 rounded-full mt-2">
            {role}
          </span>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-4">
          <div className="flex border-b border-gray-100 py-3">
            <span className="w-1/3 text-gray-500 font-medium">Email</span>
            <span className="w-2/3 text-gray-800">{email || "Not provided"}</span>
          </div>
          
          <div className="flex border-b border-gray-100 py-3">
            <span className="w-1/3 text-gray-500 font-medium">Phone</span>
            <span className="w-2/3 text-gray-800">{phone || "Not provided"}</span>
          </div>

          <div className="flex border-b border-gray-100 py-3">
            <span className="w-1/3 text-gray-500 font-medium">Status</span>
            <span className="w-2/3">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Active
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}