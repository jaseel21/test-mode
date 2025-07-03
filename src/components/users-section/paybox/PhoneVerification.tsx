"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { signIn } from "next-auth/react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

auth.useDeviceLanguage();

const isTestMode = process.env.NEXT_PUBLIC_FIREBASE_TEST_MODE === "true";
if (isTestMode) {
  console.log("Test mode is on! No real SMS will be sent.");
  try {
    auth.settings.appVerificationDisabledForTesting = true;
    console.log("appVerificationDisabledForTesting set to true");
  } catch (err) {
    console.error("Error setting appVerificationDisabledForTesting:", err);
  }
}

interface PhoneVerificationProps {
  onVerificationComplete: (phoneNumber: string) => void;
}

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
  }
}

const PhoneVerification = ({ onVerificationComplete }: PhoneVerificationProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [timer, setTimer] = useState(30);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set up reCAPTCHA on client-side mount
  useEffect(() => {
    setIsClient(true);
    if (!isClient || isTestMode) return;

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

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/check-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
        },
        body: JSON.stringify({ phone: phoneNumber, role: "BoxHolder" }),
      });

      const data: { exists: boolean; message?: string } = await response.json();

      if (!data.exists) {
        toast.error("You're not a BoxHolder", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
        return;
      }
      console.log("sssssssssssfi", response);

      const appVerifier = isTestMode ? undefined : window.recaptchaVerifier;
      if (!isTestMode && !appVerifier) throw new Error("reCAPTCHA not initialized");

      const phone = `+91${phoneNumber}`;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier as RecaptchaVerifier);
      setConfirmationResult(result);
      setStep("otp");
      startTimer();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error sending OTP:", error);
      setError(errorMessage || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = () => {
    setTimer(30);
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1);
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (!confirmationResult) throw new Error("No confirmation result available");

      const credential = await confirmationResult.confirm(otpValue);
      const idToken = await credential.user.getIdToken();

      const result = await signIn("credentials", {
        redirect: false,
        idToken,
        phone: phoneNumber,
        role: "BoxHolder",
      });

      if (!result || result.error) {
        throw new Error(result?.error || "Unknown error occurred during sign-in.");
      }

      onVerificationComplete(phoneNumber);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error verifying OTP:", error);
      setError(errorMessage || "Error verifying OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (timer > 0) return;
    handleSendOtp();
  };

  return (
    <div className="max-w-md mx-auto">
      <div id="recaptcha-container" className="hidden" />
      {step === "phone" ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <h3 className="text-2xl font-bold text-indigo-900 dark:text-gray-100 mb-6 text-center">Phone Verification</h3>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="tel"
                placeholder="Enter Phone Number"
                className={`w-full p-4 pl-12 border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  error ? "border-red-300 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400" : "border-indigo-200 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
                } rounded-lg focus:outline-none focus:ring-2 transition-all`}
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setError("");
                }}
                maxLength={10}
                pattern="[0-9]{10}"
              />
              <svg
                className="w-5 h-5 text-indigo-400 dark:text-indigo-300 absolute left-4 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <ToastContainer theme={typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"} />
            {/* {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>} */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-indigo-600 dark:bg-indigo-500 text-white dark:text-gray-100 py-4 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center"
              onClick={handleSendOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-gray-100"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </motion.button>
            <div className="text-center mt-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">We&apos;ll send a 6-digit OTP to verify your number</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="flex items-center mb-6">
            <button onClick={() => setStep("phone")} className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all">
              <svg
                className="w-6 h-6 text-indigo-800 dark:text-indigo-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h3 className="text-2xl font-bold text-indigo-900 dark:text-gray-100">Enter OTP</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Enter the 6-digit OTP sent to {phoneNumber}</p>
          <div className="flex space-x-3 mb-6 justify-center">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                className="w-14 h-14 text-center text-2xl font-bold border border-indigo-300 dark:border-gray-600 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={otp[index]}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyUp={(e) => {
                  if (e.key === "Backspace" && !otp[index] && index > 0) {
                    const prevInput = document.getElementById(`otp-${index - 1}`);
                    if (prevInput) prevInput.focus();
                  }
                }}
              />
            ))}
          </div>
          {error && <p className="text-red-600 dark:text-red-400 text-sm mb-4 text-center">{error}</p>}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-indigo-600 dark:bg-indigo-500 text-white dark:text-gray-100 py-4 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center"
            onClick={handleVerifyOtp}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-gray-100"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </motion.button>
          <div className="text-center mt-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Didn&apos;t receive OTP?{" "}
              {timer > 0 ? (
                <span className="text-indigo-600 dark:text-indigo-300">Resend in {timer}s</span>
              ) : (
                <button
                  className="text-indigo-600 dark:text-indigo-300 font-medium hover:text-indigo-800 dark:hover:text-indigo-200"
                  onClick={handleResendOtp}
                >
                  Resend OTP
                </button>
              )}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PhoneVerification;