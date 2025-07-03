"use client";

import React, { useState, useEffect } from "react";
import PhoneVerification from "@/components/users-section/receipts/PhoneVerification";
import OTPVerification from "@/components/users-section/receipts/OTPVerification";
import ReceiptList from "@/components/users-section/receipts/ReceiptList";
import { PageHeader } from "@/components/users-section/PageHeader";
import { RecaptchaVerifier, ConfirmationResult } from "firebase/auth";
import { auth, sendOTP, isTestMode } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ReceiptsPage() {
  const [step, setStep] = useState<"phone" | "otp" | "verified">("phone");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Initialize client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Restore session from sessionStorage and Firebase auth state
  useEffect(() => {
    if (!isClient) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is authenticated, check sessionStorage
        const storedPhone = sessionStorage.getItem("receipts_phone");
        if (storedPhone) {
          setPhoneNumber(storedPhone);
          setStep("verified");
        }
      } else {
        // No user, clear sessionStorage and reset to phone step
        sessionStorage.removeItem("receipts_phone");
        setStep("phone");
        setPhoneNumber("");
      }
    });

    return () => unsubscribe();
  }, [isClient]);

  // Initialize reCAPTCHA
  useEffect(() => {
    if (!isClient || isTestMode) {
      return;
    }

    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {
            console.log("Recaptcha verified");
          },
          "expired-callback": () => {
            console.log("Recaptcha expired. Please refresh.");
            setError("Recaptcha expired. Please try again.");
          },
        });
      }
      window.recaptchaVerifier.render();
    } catch (err: unknown) {
      console.error("Error initializing reCAPTCHA:", err);
      setError("Failed to initialize reCAPTCHA. Please refresh and try again.");
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, [isClient]);

  const handlePhoneSubmit = async (phoneNumber: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sendOTP(phoneNumber);
      if (!result) {
        throw new Error("Failed to send OTP. Please try again.");
      }
      setConfirmationResult(result);
      setPhoneNumber(phoneNumber);
      setStep("otp");
    } catch (error: unknown) {
      console.error("Error sending OTP:", error);
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!confirmationResult) {
        throw new Error("Verification session expired. Please try again.");
      }
      await confirmationResult.confirm(otp);
      // Store phone number in sessionStorage after successful verification
      sessionStorage.setItem("receipts_phone", phoneNumber);
      setStep("verified");
    } catch (error: unknown) {
      console.error("Error verifying OTP:", error);
      setError(error instanceof Error ? error.message : "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sendOTP(phoneNumber);
      if (!result) {
        throw new Error("Failed to resend OTP. Please try again.");
      }
      setConfirmationResult(result);
      setError("OTP resent successfully!");
    } catch (error: unknown) {
      console.error("Error resending OTP:", error);
      setError(error instanceof Error ? error.message : "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePhone = () => {
    setStep("phone");
    setPhoneNumber("");
    setConfirmationResult(null);
    setError(null);
  };

  const handleLogout = () => {
    // Show confirmation toast
    toast.info(
      <div>
        <p>Are you sure you want to log out?</p>
        <div className="flex gap-2 mt-2">
          <button
            className="px-3 py-1 bg-red-500 dark:bg-red-600 text-white rounded hover:bg-red-600 dark:hover:bg-red-700"
            onClick={async () => {
              try {
                // Sign out from Firebase
                await signOut(auth);
                // Clear sessionStorage
                sessionStorage.removeItem("receipts_phone");
                // Reset state
                setStep("phone");
                setPhoneNumber("");
                setConfirmationResult(null);
                setError(null);
                toast.success("Logged out successfully!");
              } catch (error) {
                console.error("Error signing out:", error);
                setError("Failed to log out. Please try again.");
                toast.error("Failed to log out.");
              }
              toast.dismiss(); // Close the confirmation toast
            }}
          >
            Confirm
          </button>
          <button
            className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-black dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
            onClick={() => toast.dismiss()}
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        position: "top-center",
      }
    );
  };

  return (
    <>
      <div id="recaptcha-container" className="hidden"></div>
      <PageHeader
        title="Check Your Receipt"
        subtitle="Make a lasting impact through scheduled contributions that provide consistent support to our causes."
      />
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto max-w-4xl">
          {step === "phone" && (
            <PhoneVerification
              onSubmit={handlePhoneSubmit}
              isLoading={isLoading}
              error={error}
            />
          )}
          {step === "otp" && (
            <OTPVerification
              phoneNumber={phoneNumber}
              onVerify={handleVerifyOTP}
              onResendOTP={handleResendOTP}
              onChangePhone={handleChangePhone}
              isLoading={isLoading}
              error={error}
            />
          )}
          {step === "verified" && (
            <ReceiptList
              phoneNumber={phoneNumber}
              onLogout={handleLogout}
            />
          )}
        </div>
      </section>
    </>
  );
}