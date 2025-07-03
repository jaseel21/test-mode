"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarPath, setAvatarPath] = useState("/images/avathar/avathar3.svg");
  const { data } = useSession();
  const router = useRouter();

  // Assign avatar based on user id or email hash to ensure consistency for each user
  useEffect(() => {
    if (data?.user) {
      // Generate a consistent number based on user email or id
      let hash = 0;
      const userIdentifier = data.user.email || data.user.name || "default";
      
      for (let i = 0; i < userIdentifier.length; i++) {
        hash = ((hash << 5) - hash) + userIdentifier.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }
      
      // Get absolute value and mod it with the number of avatars (assuming 10 avatars from 1 to 10)
      const avatarNumber = (Math.abs(hash) % 10) + 1;
      setAvatarPath(`/images/avathar/avathar${avatarNumber}.svg`);
    }
  }, [data?.user]);

  function toggleDropdown(e: { stopPropagation: () => void; }) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/auth/admin/sign-in');
    } catch (error) {
      console.error('Sign-out failed:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-700 dark:text-gray-300"
      >
        <div className="relative overflow-hidden rounded-full h-11 w-11 ring-2 ring-primary/20 shadow-md">
          <Image
            width={100}
            height={100}
            src={avatarPath}
            alt={data?.user?.name || "User"}
            className="object-cover transform hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="flex flex-col items-start">
          <span className="font-medium text-theme-sm">{data?.user?.name || "User"}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{data?.user?.role || "Member"}</span>
        </div>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="16"
          height="16"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-2 w-[300px] flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800 animate-fadeIn"
      >
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative overflow-hidden rounded-full h-14 w-14 ring-2 ring-primary/30 shadow-lg">
            <Image
              width={120}
              height={120}
              src={avatarPath}
              alt={data?.user?.name || "User"}
              className="object-cover"
            />
          </div>
          <div>
            <span className="block font-semibold text-base text-gray-800 dark:text-gray-200">
              {data?.user?.name || "User"}
            </span>
            <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
              {data?.user?.phone || data?.user?.email || ""}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

        {/* User menu items */}
        <ul className="space-y-1 mb-2">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/admin/profile"
              className="flex items-center gap-3 px-3 py-2.5 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
            >
              <svg
                className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Edit profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile/settings"
              className="flex items-center gap-3 px-3 py-2.5 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
            >
              <svg
                className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Settings
            </DropdownItem>
          </li>
        </ul>

        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

        <button
          className="flex items-center gap-3 px-3 py-2.5 mt-1 font-medium text-red-600 rounded-lg group text-theme-sm hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          onClick={handleSignOut}
        >
          <svg
            className="w-5 h-5 text-red-500 group-hover:text-red-600 dark:text-red-400 dark:group-hover:text-red-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}