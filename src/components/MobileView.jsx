'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnimatedEntry from './AnimatedEntry';
import { useLoading } from '@/context/LoadingContext';

const MobileView = () => {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donationCategory, setDonationCategory] = useState('General');
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    district: '',
    panchayat: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const amounts = [100, 500, 1000, 5000];
  const categories = ['General', 'Yatheem', 'Hafiz', 'Building'];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return 'Full name is required';
    if (!formData.phoneNumber.match(/^\d{10}$/)) return 'Valid 10-digit phone number is required';
    if (!formData.district.trim()) return 'District is required';
    if (!formData.panchayat.trim()) return 'Panchayat is required';
    if (!selectedAmount && !customAmount) return 'Please select or enter a donation amount';
    if (customAmount && (parseInt(customAmount) <= 0 || isNaN(parseInt(customAmount)))) {
      return 'Please enter a valid donation amount';
    }
    return null;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    startLoading();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      stopLoading();
      return;
    }

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Failed to load Razorpay SDK');

      const donationAmount = selectedAmount || parseInt(customAmount);
      const response = await fetch('/api/donations/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
        body: JSON.stringify({ amount: donationAmount * 100 }),
      });

      const orderData = await response.json();
      if (!response.ok) throw new Error(orderData.error || 'Order creation failed');

      return new Promise((resolve, reject) => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourKeyIDHere',
          amount: donationAmount * 100,
          currency: 'INR',
          name: 'AIC Amal App',
          description: `Donation for ${donationCategory}`,
          order_id: orderData.orderId,
          handler: async (response) => {
            try {
              const paymentData = {
                amount: donationAmount,
                name: formData.fullName,
                phone: formData.phoneNumber,
                type: donationCategory,
                district: formData.district,
                panchayat: formData.panchayat,
                email: formData.email,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              };

              startLoading();
              const saveResponse = await fetch('/api/donations/create', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                },
                body: JSON.stringify(paymentData),
              });

              const saveData = await saveResponse.json();
              if (!saveResponse.ok) throw new Error(saveData.error || 'Failed to save donation');

              router.push(
                `/donation/?donationId=${saveData.id}&amount=${donationAmount}&name=${encodeURIComponent(
                  formData.fullName
                )}&phone=${formData.phoneNumber}&type=${donationCategory}&district=${
                  formData.district || 'Other'
                }&panchayat=${formData.panchayat || ''}&paymentId=${response.razorpay_payment_id}&orderId=${
                  response.razorpay_order_id
                }`
              );

              resolve({
                id: saveData.id,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
              });
            } catch (error) {
              reject(error);
            } finally {
              stopLoading();
            }
          },
          prefill: { name: formData.fullName, contact: formData.phoneNumber },
          theme: { color: '#10B981' },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    } catch (error) {
      setError(`Payment initiation failed: ${error.message}`);
      stopLoading();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDonationForm = () => {
    setShowDonationForm(!showDonationForm);
  };

  const handleAmountClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
    setShowDonationForm(true);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-white overflow-hidden">
      <div
        className="absolute top-[-120px] left-[-5px] w-[500px] h-[320px] overflow-hidden"
        style={{
          transform: 'rotate(-14.73deg)',
          borderBottomLeftRadius: '70px',
          zIndex: 0,
        }}
      >
        <div
          className="w-full h-full"
          style={{
            background: 'linear-gradient(134.14deg, #9333EA 0%, #4F46E5 100%)',
            boxShadow: '0px 4px 30px rgba(170, 165, 252, 0.6)',
          }}
        />
      </div>

      <div className="relative z-10 p-6 pb-16 rounded-b-[50px] overflow-hidden">
        <div className="flex justify-between items-center">
          <button className="ml-3 p-3 rounded-full">
            <div className="w-11">
              <img src="/NavBar.svg" alt="Navigation" />
            </div>
          </button>

          <div className="flex flex-row gap-4 items-center justify-center mr-1">
            <AnimatedEntry />
          </div>
        </div>

        <div className="mt-2 items-left ml-5">
          <p className="text-white text-sm font-light uppercase">AKODE ISLAMIC CENTRE</p>
          <p className="text-white text-2xl font-bold mb-8 -mt-1.5">AMAL APP</p>
        </div>
      </div>

      <div className="relative -mt-[100px] z-20">
        <div className="w-full h-[240px] -mb-[70px] flex justify-center">
          <div
            className="w-full h-full bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/hifz.png')" }}
          />
        </div>

        <div className="flex justify-center items-center mt-6 mb-4 px-4">
          <div className="bg-[#AAA5FC] flex flex-row items-center justify-between w-full h-auto py-3 p-4 rounded-[10px]">
            <div className="flex items-end flex-col w-full">
              <p className="font-light text-[#1E1B4B] text-base">BE A</p>
              <p className="font-bold text-[#1E1B4B] text-base -mt-2">BEACON</p>
            </div>
            <div className="flex items-center justify-center w-40 mx-2">
              <span>
                <img src="/FontOF.svg" className="w-16" alt="Orphans and Hafiz" />
              </span>
            </div>
            <div className="flex items-start w-full">
              <p className="font-light text-[#1E1B4B] text-xs text-left">
                LIGHT FOR<br />ORPHANS AND<br />HAFIZ
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center px-5">
          <div className="flex flex-row space-x-1 mb-2 gap-1 mx-auto">
            {amounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleAmountClick(amount)}
                className={`px-2 py-1 rounded-[10px] flex items-center justify-center border border-[#AAA5FC] h-[37px] ${
                  selectedAmount === amount && showDonationForm ? 'bg-[#EFEEFF]' : 'bg-white'
                }`}
                style={{
                  background: selectedAmount === amount && showDonationForm ? '#EFEEFF' : 'white',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                }}
                disabled={isSubmitting}
              >
                <span className="text-[#4A4A4A] text-[18px] font-medium">₹{amount}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-2">
          <div>
            <style>
              {`
                @keyframes shine {
                    0% {
                        background-position: 200% 0;
                    }
                    100% {
                        background-position: -100% 0;
                    }
                }
                .shine-effect::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    background: linear-gradient(
                        45deg,
                        transparent 25%,
                        rgba(255, 255, 255, 0.2) 50%,
                        transparent 75%,
                        transparent 100%
                    );
                    background-size: 250% 250%;
                    background-repeat: no-repeat;
                    animation: shine 3s ease infinite;
                }
                
                .donation-form-backdrop {
                    transition: opacity 0.3s ease;
                }
                
                .donation-form-sheet {
                    transition: transform 0.3s ease;
                }
              `}
            </style>
            <button
              className="relative rounded-full py-2 px-4 overflow-hidden flex items-center justify-center w-[172px] shine-effect"
              style={{
                background: 'linear-gradient(90deg, #9333EA 0%, #4F46E5 100%)',
              }}
              onClick={toggleDonationForm}
              disabled={isSubmitting}
            >
              <span className="text-white font-medium text-lg text-center">Donate Now</span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center">
          <div className="mb-4 text-center">
            <p className="text-[#3730A3] font-semibold text-base md:text-lg">Download Our App</p>
            <p className="text-gray-500 text-xs md:text-sm">Available on iOS and Android</p>
          </div>

          <div className="flex flex-row space-x-4 w-full justify-center px-4 sm:px-0">
            <Link
              href="https://play.google.com/store/apps/details?id=com.aic.amal"
              className="flex w-36 sm:w-40 h-12 bg-black text-white rounded-xl items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <div className="mr-2 sm:mr-3">
                <svg viewBox="30 336.7 120.9 129.2" width="18" className="sm:w-5">
                  <path
                    fill="#FFD400"
                    d="M119.2,421.2c15.3-8.4,27-14.8,28-15.3c3.2-1.7,6.5-6.2,0-9.7 c-2.1-1.1-13.4-7.3-28-15.3l-20.1,20.2L119.2,421.2z"
                  />
                  <path
                    fill="#FF3333"
                    d="M99.1,401.1l-64.2,64.7c1.5,0.2,3.2-0.2,5.2-1.3 c4.2-2.3,48.8-26.7,79.1-43.3L99.1,401.1L99.1,401.1z"
                  />
                  <path
                    fill="#48FF48"
                    d="M99.1,401.1l20.1-20.2c0,0-74.6-40.7-79.1-43.1 c-1.7-1-3.6-1.3-5.3-1L99.1,401.1z"
                  />
                  <path
                    fill="#3BCCFF"
                    d="M99.1,401.1l-64.3-64.3c-2.6,0.6-4.8,2.9-4.8,7.6 c0,7.5,0,107.5,0,113.8c0,4.3,1.7,7.4,4.9,7.7L99.1,401.1z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-xs">GET IT ON</div>
                <div className="text-sm sm:text-sm font-semibold font-sans -mt-1">Google Play</div>
              </div>
            </Link>

            <Link
              href="https://apps.apple.com/us/app/aic-amal/id6743961924"
              className="flex w-36 sm:w-40 h-12 bg-black text-white rounded-xl items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <div className="mr-2 sm:mr-3">
                <svg viewBox="0 0 384 512" width="18" className="sm:w-5">
                  <path
                    fill="currentColor"
                    d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-xs">Download on the</div>
                <div className="text-sm sm:text-sm font-semibold font-sans -mt-1">App Store</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {showDonationForm && (
        <>
          <div
            className="donation-form-backdrop fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleDonationForm}
          />

          <div
            className="donation-form-sheet fixed bottom-0 left-0 right-0 bg-gray-50 rounded-t-3xl shadow-lg z-50 h-[80%] overflow-y-auto"
            style={{
              transform: showDonationForm ? 'translateY(0)' : 'translateY(100%)',
            }}
          >
            <div className="p-4 pb-8">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-[#3730A3] font-bold text-xl">Donation Form</h3>
                <p className="text-gray-500 text-sm">Support our cause with your generosity</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
              )}

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6 px-4">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setDonationCategory(category)}
                    className={`py-3 px-3 rounded-xl text-center text-sm font-semibold text-indigo-800 ${
                      donationCategory === category
                        ? 'bg-indigo-100 border border-indigo-300'
                        : 'bg-indigo-300'
                    }`}
                    disabled={isSubmitting}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="px-4">
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      placeholder="Full Name"
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 pl-10 rounded-xl border border-indigo-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center text-indigo-400">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleFormChange}
                      placeholder="Phone Number"
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 pl-10 rounded-xl border border-indigo-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center text-indigo-400">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22 16.92V19.92C22 20.4704 21.7893 20.9978 21.4142 21.3728C21.0391 21.7479 20.5117 21.9586 19.96 21.96C18.25 22.05 16.58 21.73 15.04 21.05C13.58 20.41 12.26 19.44 11.13 18.26C10.0023 17.1343 9.06383 15.8137 8.35001 14.35C7.66001 12.8 7.34001 11.13 7.44001 9.42C7.44244 8.87005 7.65359 8.34419 8.02812 7.97179C8.40264 7.59939 8.92769 7.39095 9.48001 7.39H12.48C13.3151 7.38519 14.0365 7.90608 14.23 8.71C14.35 9.36 14.51 9.99 14.71 10.59C14.9224 11.1373 14.8796 11.7448 14.59 12.26L13.69 13.91C14.8381 16.1869 16.6231 17.972 18.9 19.12L20.55 18.22C21.0654 17.9303 21.6728 17.8875 22.22 18.1C22.82 18.3 23.45 18.46 24.1 18.58C24.9141 18.7733 25.4352 19.4948 25.43 20.33L22 16.92Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleFormChange}
                      placeholder="District"
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 pl-10 rounded-xl border border-indigo-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center text-indigo-400">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      name="panchayat"
                      value={formData.panchayat}
                      onChange={handleFormChange}
                      placeholder="Panchayat"
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 pl-10 rounded-xl border border-indigo-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center text-indigo-400">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 22V12H15V22"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="Email (Optional)"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 pl-10 rounded-xl border border-indigo-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center text-indigo-400">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 6L12 13L2 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between mb-4">
                    {amounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount(amount.toString());
                        }}
                        disabled={isSubmitting}
                        className={`px-3 py-2 rounded-xl flex items-center justify-center border border-indigo-400 ${
                          selectedAmount === amount
                            ? 'bg-indigo-600 text-white'
                            : 'bg-indigo-100 text-indigo-700'
                        } disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed`}
                      >
                        <span className="font-medium">₹{amount}</span>
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      placeholder="Enter custom amount"
                      disabled={isSubmitting}
                      min="1"
                      className="w-full px-4 py-3 pl-10 rounded-xl border border-indigo-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center text-indigo-400">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 1V23"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {(selectedAmount || customAmount) && (
                    <div className="mt-4 bg-indigo-50 p-3 rounded-xl flex justify-between items-center">
                      <span className="text-indigo-700 font-medium">Selected Amount:</span>
                      <span className="text-indigo-800 font-bold text-xl">
                        ₹{selectedAmount || parseInt(customAmount) || 0}
                      </span>
                    </div>
                  )}
                </div>

                <div className="w-full flex items-center justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`relative rounded-full py-3 px-4 overflow-hidden flex items-center justify-center w-[172px] shine-effect text-white ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                    style={{
                      background: 'linear-gradient(90deg, #9333EA 0%, #4F46E5 100%)',
                    }}
                  >
                    {isSubmitting ? 'PROCESSING...' : 'PAY NOW'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileView;