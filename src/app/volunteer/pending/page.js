"use client";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/Context/SessionContext";
import { signOut } from "next-auth/react";

const PendingStatusPage = () => {
  const session = useSession();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name);
    }
  }, [session]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Registration Submitted
        </h1>
        <p className="text-gray-600 mb-6">
          Hello {userName}, your volunteer registration was successfully
          completed. Please wait for approval from AIC.
        </p>

        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>

        <p className="text-sm text-gray-500">
          You’ll be notified once your registration is approved. Thank you for
          your patience!
        </p>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default PendingStatusPage;