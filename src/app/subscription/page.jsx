// File Path: ./src/app/subscription/page.jsx

"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/users-section/subscription/PageHeader";
import { SuccessMessage } from "@/components/users-section/subscription/SuccessMessage";
import { UserModeSelection } from "@/components/users-section/subscription/UserModeSelection";
import { SubscriptionTypeSelection } from "@/components/users-section/subscription/SubscriptionTypeSelection";
import { SubscriptionForm } from "@/components/users-section/subscription/SubscriptionForm";
import { PhoneInput } from "@/components/users-section/subscription/PhoneInput";
import { OtpVerification } from "@/components/users-section/subscription/OtpVerification";
import { UserDashboard } from "@/components/users-section/subscription/UserDashboard";
import { BenefitsSection } from "@/components/users-section/subscription/BenefitsSection";
import { Footer } from "@/components/users-section/subscription/Footer";
import PricingDetails from "@/components/users-section/subscription/PricingDetails";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLoading } from "@/context/LoadingContext";

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

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function SubscriptionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [paymentStatus, setPaymentStatus] = useState("");
  const [donor, setDonor] = useState(null);
  const [userMode, setUserMode] = useState("new");
  const [loginStep, setLoginStep] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpInput, setOtpInput] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [subscriptionType, setSubscriptionType] = useState(null);
  const [user, setUser] = useState(null);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessageContent, setSuccessMessageContent] = useState({
    title: "",
    message: "",
  });
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(undefined);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(4);
  const { startLoading, stopLoading } = useLoading();

  const donationTypes = [
    { id: 1, name: "General" },
    { id: 2, name: "Yatheem" },
    { id: 3, name: "Hafiz" },
    { id: 4, name: "Building" },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchUserData = useCallback(async (phone, page = 1) => {
    setIsLoading(true);
    startLoading();
    try {
      const searchResponse = await fetch(`/api/subscriptions/search?phone=${encodeURIComponent(phone)}`, {
        headers: {
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
      });
      const searchData = await searchResponse.json();
      if (!searchResponse.ok) throw new Error(searchData.message || "Failed to search subscriptions");

      const { donorId, subscriptionId } = searchData;

      const detailsResponse = await fetch(`/api/subscriptions/details?donorId=${donorId}&subscriptionId=${subscriptionId}`, {
        headers: {
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
      });
      const detailsData = await detailsResponse.json();
      if (!detailsResponse.ok) throw new Error(detailsData.message || "Failed to fetch subscription details");

      const historyResponse = await fetch(
        `/api/donations/subhistory?subscriptionId=${subscriptionId}&page=${page}&limit=${itemsPerPage}`,
        {
          headers: {
            'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
          },
        }
      );
      const history = await historyResponse.json();
      if (!historyResponse.ok) throw new Error(history.error || "Failed to fetch donation history");

      setDonor(detailsData.donor);
      setSubscriptionData(detailsData.subscription);
      setPaymentHistory(history.data || []);

      const pagination = history.pagination || { currentPage: 1, totalPages: 1 };
      setCurrentPage(pagination.currentPage || 1);
      setTotalPages(pagination.totalPages || 1);
      setPaymentStatus(detailsData.subscription.paymentStatus);

      setUser({
        name: detailsData.donor?.name || "Unknown Donor",
        phoneNumber: phone,
        email: detailsData.donor?.email || " Not found",
        joinedDate: detailsData.donor?.joinedDate || "2023-01-15",
        totalDonations: detailsData?.totalAmount || 215000,
      });

      setUserSubscriptions(
        detailsData.subscription
          ? [{
              id: subscriptionId,
              phoneNumber: phone,
              razorpaySubscriptionId: detailsData.subscription.razorpaySubscriptionId,
              amount: detailsData.subscription.amount || 0,
              period: detailsData.subscription.period || "not fin",
              type: detailsData.subscription.method || "manual",
              donationType: detailsData.subscription.donationType || "General",
              lastPaymentDate: detailsData.subscription.lastPaymentAt || "",
              nextPaymentDue: detailsData.subscription.nextDueDate || "2025-04-15",
            }]
          : []
      );

      stopLoading();
    } catch (error) {
      console.error("Error fetching user data:", error);
      setOtpError("Failed to fetch user data. Please try again.");
    } finally {
      stopLoading();
      setIsLoading(false);
    }
  }, [itemsPerPage, startLoading, stopLoading]);

  useEffect(() => {
    console.log("Session:", session, "Status:", status, "UserMode:", userMode);
    if (status === "authenticated" && session?.user?.role === "Subscriber" && session?.user?.phone) {
      setPhoneNumber(session.user.phone);
      fetchUserData(session.user.phone, 1);
      if (userMode === "existing") {
        setLoginStep("dashboard");
      }
    } else if (status === "authenticated" && session?.user?.role !== "Subscriber") {
      setLoginStep("phone");
    } else if (status === "unauthenticated" && userMode === "existing") {
      setLoginStep("phone");
    }
  }, [session, status, userMode, fetchUserData]);

  useEffect(() => {
    if (!isClient || isTestMode) return;

    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => console.log("Recaptcha verified"),
          "expired-callback": () => {
            console.log("Recaptcha expired. Please refresh.");
            setOtpError("Recaptcha expired. Please try again.");
          },
        });
      }
      window.recaptchaVerifier.render();
    } catch (err) {
      console.error("Error initializing reCAPTCHA:", err);
      setOtpError("Failed to initialize reCAPTCHA. Please refresh and try again.");
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, [isClient]);

  const createPlan = async (plan, formData) => {
    try {
      const [district, panchayat] = formData.location.split(", ").map((part) => part.trim());
      const response = await axios.post("/api/create-plan", {
        name: formData.fullName,
        phoneNumber,
        amount: plan.amount,
        district,
        panchayat,
        period: plan.period,
        interval: 1,
      }, {
        headers: {
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
      });
      if (!response.data.planId) throw new Error("Plan ID not received from server");
      return response.data.planId;
    } catch (error) {
      console.error("Error creating plan:", error);
      throw error;
    }
  };

  const handleSubscriptionAutoSubmit = async (e, formData) => {
    e.preventDefault();
    startLoading();
    setIsLoading(true);

    if (!formData.amount || isNaN(formData.amount)) {
      alert("Please enter a valid amount.");
      return;
    }

    const checkResponse = await fetch("/api/check-phone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
      },
      body: JSON.stringify({ phone: phoneNumber, role: "Subscriber" }),
    });
    const checkData = await checkResponse.json();

    if (checkData.exists) {
      toast.info("You are a subscription user, not a new one.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      setIsLoading(false);
      stopLoading();
      return;
    }

    const customPlan = {
      amount: formData.amount,
      period: formData.period,
      interval: 1,
    };
    await handlePayment(e, { ...formData, email: formData.email || "" }, customPlan);
    setIsLoading(false);
    stopLoading();
  };

  const standardizePhoneNumber = (phone) => {
    if (!phone) return null;
    const cleanedPhone = phone.replace(/\D/g, "");
    if (phone.startsWith("+")) return phone;
    if (cleanedPhone.length === 10) return `+91${cleanedPhone}`;
    console.warn(`Invalid phone number format: ${phone}`);
    return null;
  };
  
  const handlePayment = async (_e, formData, customPlan) => {
    if (!formData.fullName) {
      alert("Please enter your name.");
      return;
    }
    try {
      startLoading();
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay SDK. Please try again.");
        return;
      }
      const [district, panchayat] = formData.location.split(", ").map((part) => part.trim());

      const planId = await createPlan(customPlan, formData);
      if (!planId) throw new Error("Plan ID not received");

      const { data } = await axios.post(
        "/api/create-subscription",
        { planId, name: formData.fullName,
           amount: formData.amount* 100,
            phone: phoneNumber,
            period: formData.period,
            name:formData.fullName,
             district:district,
             panchayat:panchayat,
             email:formData.email,
             },
        {
          headers: {
            'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
          },
        }
      );
      if (data.error) throw new Error(data.details || data.error);
      const subscriptionId = data.subscriptionId;
      if (!subscriptionId) throw new Error("Subscription ID not received");

  

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        subscription_id: subscriptionId,
        name: "Donation App",
        description: `Donation Subscription for ${customPlan.period} plan`,
        amount: formData.amount * 100,
        currency: "INR",
        handler: async (response) => {
          // const { data } = await axios.post(
          //   // "/api/update-subscription-status",
          //   // {
          //   //   razorpaySubscriptionId: subscriptionId,
          //   //   name: formData.fullName,
          //   //   amount: formData.amount,
          //   //   phoneNumber,
          //   //   district,
          //   //   type: "General",
          //   //   method: "auto",
          //   //   planId,
          //   //   email: formData.email,
          //   //   panchayat,
          //   //   period: formData.period,
          //   //   razorpayOrderId: response.razorpay_order_id || "",
          //   //   razorpay_payment_id: response.razorpay_payment_id,
          //   //   status: "active",
          //   // },
          //   // {
          //   //   headers: {
          //   //     'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
          //   //   },
          //   // }
          // );

          stopLoading();

          router.push(
            `/subscription/success?donationId=${"no id"}&amount=${formData.amount}&method=${"auto"}&name=${encodeURIComponent(
              formData.fullName
            )}&phone=${phoneNumber}&type=General&district=${district || "Other"}&panchayat=${
              panchayat || ""
            }&paymentId=${response.razorpay_payment_id}&orderId=${response.razorpay_order_id || ""}&method=${"auto" || ""}`
          );
        },
        prefill: { contact: phoneNumber, name: formData.fullName },
        theme: { color: "#F37254" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
      setIsLoading(false);
      stopLoading();
    } catch (error) {
      console.error("Error in handlePayment:", error);
      alert(`An error occurred: ${error.message || "Unknown error"}`);
    }
  };

  const handleSubscriptionSubmit = async (e, formData) => {
    e.preventDefault();
    setIsLoading(true);
    startLoading();

    try {
      const checkResponse = await fetch("/api/check-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
        body: JSON.stringify({ phone: phoneNumber, role: "Subscriber" }),
      });

      const checkData = await checkResponse.json();
      if (checkData.exists) {
        toast.info("You are a subscription user, not a new one.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
        setIsLoading(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay SDK.");
        setIsLoading(false);
        stopLoading();
        return;
      }

      const [district, panchayat] = formData.location.split(", ").map((part) => part.trim());

      const orderResponse = await fetch("/api/donations/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
        body: JSON.stringify({
           amount: formData.amount * 100,
           name: formData.fullName,
            phone: phoneNumber,
            period: formData.period,
            type: "Subscription",
            method: "manual",
            email: formData.email,
            district,
            panchayat: panchayat || null,
           }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.error || "Order creation failed");

      

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourKeyIDHere",
        amount: formData.amount * 100,
        currency: "INR",
        name: "AIC Amal App",
        description: `Subscription for General (${formData.period})`,
        order_id: orderData.orderId,
        handler: async (response) => {
          const subscriptionData = {
            name: formData.fullName,
            phone: phoneNumber,
            amount: formData.amount,
            period: formData.period,
            type: "General",
            method: "manual",
            email: formData.email,
            district,
            panchayat: panchayat || null,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            status: "active",
          };

          startLoading();
          // const saveResponse = await fetch("/api/subscriptions/new", {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //     'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
          //   },
          //   body: JSON.stringify(subscriptionData),
          // });

          // const saveData = await saveResponse.json();
          // if (!saveResponse.ok) throw new Error(saveData.error || "Failed to save subscription");

         
            // alert("You are already a subscription user.");
        
            stopLoading();
            router.push(
              `/subscription/success?subscriptionId=${"no Id found"}&amount=${formData.amount}&name=${encodeURIComponent(
                formData.fullName
              )}&phone=${phoneNumber}&type=General&district=${district}&panchayat=${panchayat || ""}&paymentId=${
                response.razorpay_payment_id
              }&orderId=${response.razorpay_order_id}`
            );
        

          setSuccessMessageContent({
            title: "Subscription Activated!",
            message: `Your ${subscriptionType === "auto" ? "automatic" : "manual"} recurring donation has been set up successfully. Thank you for your ongoing support!`,
          });
          setTimeout(() => setShowSuccessMessage(false), 3000);
        },
        prefill: { name: formData.fullName, contact: phoneNumber },
        theme: { color: "#3B82F6" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error creating subscription:", error);
    } finally {
      setIsLoading(false);
      stopLoading();
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();

    if (phoneNumber.length < 10) {
      setOtpError("Phone number must be at least 10 digits");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch("/api/check-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
        body: JSON.stringify({ phone: phoneNumber, role: "Subscriber" }),
      });

      const data = await response.json();
      if (!data.exists) {
        toast.error("Phone number not registered as a subscriber", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      }

      const appVerifier = isTestMode ? undefined : window.recaptchaVerifier;
      if (!isTestMode && !appVerifier) throw new Error("reCAPTCHA not initialized");

      const phone = "+91" + phoneNumber;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      setLoginStep("otp");
    } catch (error) {
      const errorMessage = error.message || "Unknown error";
      console.error("Error sending OTP:", error);
      setOtpError(errorMessage || "Failed to send OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otpInput];
    newOtp[index] = value;
    setOtpInput(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpInput[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const otp = otpInput.join("");
    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    setOtpError("");

    try {
      if (!confirmationResult) throw new Error("No confirmation result available");

      const credential = await confirmationResult.confirm(otp);
      const idToken = await credential.user.getIdToken();

      const result = await signIn("credentials", {
        redirect: false,
        idToken,
        phone: phoneNumber,
        role: "Subscriber",
      });

      if (!result || result.error) {
        throw new Error(result?.error || "Unknown error occurred during sign-in.");
      }

      await fetchUserData(phoneNumber);
      setLoginStep("dashboard");
    } catch (error) {
      const errorMessage = error.message || "Unknown error";
      console.error("Error verifying OTP:", error);
      setOtpError(errorMessage || "Error verifying OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePageChange = (page) => {
    if (phoneNumber) {
      fetchUserData(phoneNumber, page);
    }
  };

  const handleMakePayment = async (subscription) => {
 
    startLoading();
    setIsLoading(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load Razorpay SDK.");
      setIsLoading(false);
      stopLoading();
      return;
    }

    try {
      // const checkResponse = await fetch("/api/check-phone", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
      //   },
      //   body: JSON.stringify({ phone: phoneNumber, role: "Subscriber" }),
      // });

      // const checkData = await checkResponse.json();
      // if (checkData.exists) {
      //   toast.info("You are a subscription user, not a new one.", {
      //     position: "top-right",
      //     autoClose: 3000,
      //     hideProgressBar: false,
      //     closeOnClick: true,
      //     pauseOnHover: true,
      //   });
      //   setIsLoading(false);
      //   return;
      // }

      // const scriptLoaded = await loadRazorpayScript();
      // if (!scriptLoaded) {
      //   alert("Failed to load Razorpay SDK.");
      //   setIsLoading(false);
      //   stopLoading();
      //   return;
      // }

      // const [district, panchayat] = formData.location.split(", ").map((part) => part.trim());


     
      
      const orderResponse = await fetch("/api/donations/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },


        //  donorId: subscriptionData.donorId,
        //     subscriptionId: subscriptionData._id,
        //     name: subscriptionData.name,
        //     email: subscriptionData.email,
        //     phone: subscriptionData.phone,
        //     amount: parseFloat(subscriptionData.amount),
        //     period: subscriptionData.period,
        //     type: "Subscription-charge",
        //     district: subscriptionData.district,
        //     method: "manual",
        //     panchayat: subscriptionData.panchayat,


        body: JSON.stringify({
           amount: subscriptionData.amount * 100,
            donorId: subscriptionData.donorId,
             subscriptionId: subscriptionData._id,
           name: subscriptionData.name,
            phone: subscriptionData.phone,
            period: subscriptionData.period,
            type: "Subscription-charge",
            method: "manual",
            email: subscriptionData.email,
            district:subscriptionData.district,
            panchayat: subscriptionData.panchayat || null,
           }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.error || "Order creation failed");

      

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourKeyIDHere",
        amount: subscriptionData.amount * 100,
        currency: "INR",
        name: "AIC Amal App",
        description: `Subscription for General (${subscriptionData.period})`,
        order_id: orderData.orderId,
        handler: async (response) => {
          const subscriptionData = {
           
          
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          startLoading();
          // const saveResponse = await fetch("/api/subscriptions/new", {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //     'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
          //   },
          //   body: JSON.stringify(subscriptionData),
          // });

          // const saveData = await saveResponse.json();
          // if (!saveResponse.ok) throw new Error(saveData.error || "Failed to save subscription");

         
            // alert("You are already a subscription user.");
        
            stopLoading();
            router.push(
              `/subscription/success?subscriptionId=${"no Id found"}&amount=${subscriptionData.amount}&name=${encodeURIComponent(
                subscriptionData.fullName
              )}&phone=${phoneNumber}&type=General&district=${subscriptionData.district}&panchayat=${subscriptionData.panchayat || ""}&paymentId=${
                response.razorpay_payment_id
              }&orderId=${response.razorpay_order_id}`
            );
        

          setSuccessMessageContent({
            title: "Subscription Activated!",
            message: `Your ${subscriptionType === "auto" ? "automatic" : "manual"} recurring donation has been set up successfully. Thank you for your ongoing support!`,
          });
          setTimeout(() => setShowSuccessMessage(false), 3000);
        },
        prefill: { name: subscriptionData.name, contact: subscriptionData.phone },
        theme: { color: "#3B82F6" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error creating subscription:", error);
    } finally {
      setIsLoading(false);
      stopLoading();
    }
  };

  const handleCancelManualPayment = async (subscription) => {
    toast(
      <div className="p-6 bg-white rounded-lg shadow-lg max-w-xs w-full text-center">
        {/* Icon */}
        <svg
          className="w-12 h-12 mx-auto text-red-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>

        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Cancel Subscription?</h2>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-6">This action cannot be undone.</p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => toast.dismiss()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 transition-colors min-w-[90px]"
            disabled={isLoading}
          >
            NO
          </button>
          <button
            onClick={async () => {
              startLoading();
              setIsLoading(true);
              try {
                const response = await fetch(`/api/subscriptions/cancel?subscriptionId=${subscription._id}`, {
                  method: "DELETE",
                  headers: {
                    'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                  },
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || "Failed to cancel subscription");
                }

                await signOut({ redirect: false });
                router.push("/subscription");
                toast.success("Subscription canceled successfully", {
                  position: "top-center",
                  autoClose: 3000,
                });
              } catch (error) {
                console.error("Error canceling subscription:", error);
                toast.error("Failed to cancel subscription", {
                  position: "top-center",
                  autoClose: 3000,
                });
              } finally {
                stopLoading();
                setIsLoading(false);
                toast.dismiss();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[90px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Canceling...
              </>
            ) : (
              "Yes"
            )}
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        position: "top-center",
        className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50",
        style: { background: "transparent", padding: 0 },
      }
    );
  };

  const handleCancelAutoPayment = async (
    subscription,
    setSuccessMessageContent,
    setShowSuccessMessage,
    setUserSubscriptions,
    userSubscriptions,
    router
  ) => {
    const subscriptionId = subscription.razorpaySubscriptionId;

    toast(
      <div className="p-6 bg-white rounded-lg shadow-lg max-w-md w-full text-center">
        {/* Title */}
        <p className="text-xl font-semibold text-gray-900 mb-3">
          Confirm Auto Payment Cancellation
        </p>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-6">
          Are you certain you wish to cancel your automatic payment? This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                const response = await axios.post("/api/cancel-subscription", { subscriptionId }, {
                  headers: {
                    'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                  },
                });

                if (response.data.success === true) {
                  await signOut({ redirect: false });
                  router.push("/subscription");

                  setSuccessMessageContent({
                    title: "Auto Payment Cancelled",
                    message:
                      "Your automatic payment has been cancelled successfully. You can set up a new subscription at any time.",
                  });
                  toast.success("Auto payment cancelled successfully!", {
                    position: "top-center",
                  });
                  setShowSuccessMessage(true);

                  setUserSubscriptions(
                    userSubscriptions.filter((sub) => sub.id !== subscription.id)
                  );
                } else {
                  console.error(
                    "Cancellation failed:",
                    response.data.error || "Unknown error"
                  );
                  toast.error(
                    `Failed to cancel subscription: ${response.data.error || "Unknown error"}`,
                    {
                      position: "top-center",
                    }
                  );
                }
              } catch (error) {
                console.error("Error cancelling auto payment:", error);
                toast.error(
                  `Failed to cancel subscription: ${error.message || "Unknown error"}`,
                  {
                    position: "top-center",
                  }
                );
              } finally {
                setIsLoading(false);
                toast.dismiss();
              }
            }}
            className="px-5 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors min-w-[100px]"
            disabled={isLoading}
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 transition-colors min-w-[100px]"
            disabled={isLoading}
          >
            No
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        position: "top-center",
        className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50",
        style: { background: 'transparent', padding: 0 },
      }
    );
  };

  return (
    <>
      <PageHeader
        title="Recurring Donations"
        subtitle="Make a lasting impact through scheduled contributions that provide consistent support to our causes."
      />

      <SuccessMessage
        show={showSuccessMessage}
        title={successMessageContent.title}
        message={successMessageContent.message}
        onClose={() => setShowSuccessMessage(false)}
      />
      <ToastContainer />

      <div id="recaptcha-container" className="hidden" />

      <section className="py-20 px-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
        <div className="container mx-auto max-w-6xl">
          {(userMode === "new" && !subscriptionType) || (userMode === "existing" && loginStep === "phone" && status !== "authenticated") ? (
            <UserModeSelection
              userMode={userMode}
              setUserMode={setUserMode}
              setLoginStep={setLoginStep}
            />
          ) : null}

          {userMode === "new" && (
            <>
              {!subscriptionType ? (
                <SubscriptionTypeSelection setSubscriptionType={setSubscriptionType} />
              ) : (
                <SubscriptionForm
                  subscriptionType={subscriptionType}
                  setSubscriptionType={setSubscriptionType}
                  phoneNumber={phoneNumber}
                  setPhoneNumber={setPhoneNumber}
                  handleSubscriptionSubmit={handleSubscriptionSubmit}
                  handleSubscriptionAutoSubmit={handleSubscriptionAutoSubmit}
                  isLoading={isLoading}
                  donationTypes={donationTypes}
                />
              )}
            </>
          )}

          {userMode === "existing" && (
            <>
              {(loginStep === "phone" || status === "loading") && (
                <PhoneInput
                  phoneNumber={phoneNumber}
                  setPhoneNumber={setPhoneNumber}
                  handlePhoneSubmit={handlePhoneSubmit}
                  isVerifying={isVerifying}
                  setUserMode={setUserMode}
                />
              )}
              {loginStep === "otp" && (
                <OtpVerification
                  phoneNumber={phoneNumber}
                  otpInput={otpInput}
                  setOtpInput={setOtpInput}
                  handleOtpChange={handleOtpChange}
                  handleOtpKeyDown={handleOtpKeyDown}
                  handleVerifyOtp={handleVerifyOtp}
                  isVerifying={isVerifying}
                  otpError={otpError}
                  setLoginStep={setLoginStep}
                />
              )}
              {loginStep === "dashboard" && user && (
                <UserDashboard
                  user={user}
                  userSubscriptions={userSubscriptions}
                  paymentHistory={paymentHistory}
                  paymentStatus={paymentStatus}
                  isLoading={isLoading}
                  handleMakePayment={handleMakePayment}
                  handleCancelAutoPayment={handleCancelAutoPayment}
                  handleCancelManualPayment={handleCancelManualPayment}
                  subscriptionData={subscriptionData}
                  setLoginStep={setLoginStep}
                  setUserMode={setUserMode}
                  setSubscriptionType={setSubscriptionType}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </section>
      <BenefitsSection />
      <PricingDetails />
      <Footer />
    </>
  );
}