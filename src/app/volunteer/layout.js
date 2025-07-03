import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import {SessionProvider} from "../../lib/Context/SessionContext"


export default async function VolunteerLayout({ children }) {
  const session = await getServerSession(authOptions);
  console.log(session);
  if (!session || session.user.role !== "Volunteer") {
    return redirect("/auth/v/sign-in");
  }



  return (
    <div>
    <header className="bg-gradient-to-r from-blue-600 to-blue-500 shadow-md">
  <div className="container mx-auto px-4 py-3">
    <div className="flex items-center justify-between">
      {/* Logo and Brand */}
      <div className="flex items-center space-x-2">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <Link 
          href="/" 
          className="text-xl font-bold text-white hover:text-blue-100 transition-colors"
        >
          Volunteer Portal
        </Link>
      </div>
      
      {/* Navigation and Actions */}
      <div className="flex items-center space-x-2">
        {/* Optional: Navigation Links */}
        <nav className="hidden md:flex items-center space-x-4 mr-4">
          {/* <Link href="/dashboard" className="text-blue-100 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/tasks" className="text-blue-100 hover:text-white transition-colors">
            Tasks
          </Link> */}
          <Link href="volunteer/profile" className="text-blue-100 hover:text-white transition-colors">
            Profile
          </Link>
        </nav>
        
        {/* Sign Out Button */}
        <Link 
          href="/auth/v/signout" 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </Link>
        
        {/* Optional: Mobile Menu Button */}
        <button className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</header>

      <SessionProvider session={session}>

      <main className="p-6">{children}</main>
      </SessionProvider>
      
    </div>
  );
}