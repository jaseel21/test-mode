'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { useRouter } from 'next/navigation';

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

auth.useDeviceLanguage();

// Enable test mode if specified
const isTestMode = process.env.NEXT_PUBLIC_FIREBASE_TEST_MODE === 'true';
if (isTestMode) {
  console.log('Test mode is on! No real SMS will be sent.');
  try {
    auth.settings.appVerificationDisabledForTesting = true;
    console.log('appVerificationDisabledForTesting set to true');
  } catch (err) {
    console.error('Error setting appVerificationDisabledForTesting:', err);
  }
}

export default function SignInForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaReady, setRecaptchaReady] = useState(isTestMode);
  const router = useRouter();
  const otpInputs = useRef([]);

  // Setup reCAPTCHA verifier
  useEffect(() => {
    if (isTestMode) {
      setRecaptchaReady(true);
      return;
    }

    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('Recaptcha verified');
            setRecaptchaReady(true);
          },
          'expired-callback': () => {
            console.log('Recaptcha expired. Please refresh.');
            setRecaptchaReady(false);
            setError('Recaptcha expired. Please try again.');
          },
        });
      }
      window.recaptchaVerifier.render().then(() => {
        setRecaptchaReady(true);
      });
    } catch (err) {
      console.error('Error initializing reCAPTCHA:', err);
      setError('Failed to initialize reCAPTCHA. Please refresh and try again.');
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  // Update formatted phone
  useEffect(() => {
    if (phoneNumber) {
      setFormattedPhone(`+91${phoneNumber}`);
    } else {
      setFormattedPhone('');
    }
  }, [phoneNumber]);

  // Handle phone number input
  const handlePhoneInput = (value) => {
    const digitsOnly = value.replace(/\D/g, '');
    setPhoneNumber(digitsOnly.slice(0, 10));
  };

  // Handle OTP input
  const handleOtpInput = (index, value) => {
    const newOtp = [...otp];
    const digit = value.replace(/\D/g, '');
    newOtp[index] = digit.slice(0, 1);
    setOtp(newOtp);

    if (digit && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  // Handle OTP key events
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  // Handle phone number submission
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/check-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
        },
        body: JSON.stringify({ phone: formattedPhone, role: "Admin" }),
      });

      let data;
      try {
        data = await response.json();
        console.log('Response from /api/check-phone:', data);
      } catch (jsonErr) {
        console.error('Error parsing response JSON:', jsonErr);
        throw new Error('Invalid response from server. Please try again.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check phone number');
      }

      if (!data.exists) {
        throw new Error('Phone number not registered as admin');
      }

      console.log('Attempting to send OTP to:', formattedPhone);
      const appVerifier = isTestMode ? undefined : window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      console.log('signInWithPhoneNumber result:', result);
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!confirmationResult) {
      setError('Something went wrong. Try entering your phone number again.');
      setLoading(false);
      return;
    }

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      
      console.log('Verifying OTP:', otpString);
      const credential = await confirmationResult.confirm(otpString);
      console.log('User verified:', credential.user);

      const idToken = await credential.user.getIdToken();
      console.log('Firebase ID Token:', idToken);

      const result = await signIn('credentials', {
        redirect: false,
        idToken,
        phone: formattedPhone,
        role: "Admin",
      });

      console.log("Sign-in result:", result);
     

      if (!result || result.error) {
        throw new Error(result?.error || 'Unknown error occurred during sign-in.');
      }

    
      router.push('/admin');
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(err.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-md p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zm0 0c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4-4 1.79-4 4z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-600">Secure access for administrators</p>
        </div>

        <div id="recaptcha-container" className="hidden"></div>

        {!otpSent ? (
          <form onSubmit={handlePhoneSubmit} className="mt-8 space-y-6">
            <div className="space-y-1">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneInput(e.target.value)}
                  placeholder="9876543210"
                  required
                  maxLength={10}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-r-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              {isTestMode && (
                <p className="mt-2 text-sm text-indigo-600">
                  Test mode: Use a test number from Firebase Console
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!isTestMode && !recaptchaReady) || phoneNumber.length !== 10}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200
                ${loading || (!isTestMode && !recaptchaReady) || phoneNumber.length !== 10
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500'}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking...
                </span>
              ) : (!isTestMode && !recaptchaReady) ? 'Loading reCAPTCHA...' : 'Send OTP'}
            </button>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="mt-8 space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1 flex gap-2 justify-between">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpInput(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    ref={(el) => (otpInputs.current[index] = el)}
                    maxLength={1}
                    className="appearance-none w-12 h-12 text-center text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                ))}
              </div>
              {isTestMode && (
                <p className="mt-2 text-sm text-indigo-600">
                  Test mode: Use test OTP like 123456
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200
                ${loading || otp.join('').length !== 6
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500'}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : 'Verify OTP'}
            </button>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setError('');
                  setOtp(['', '', '', '', '', '']);
                }}
                className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                Use different number
              </button>
              <button
                type="button"
                disabled={loading}
                className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50 transition-colors duration-200"
              >
                Resend code
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </form>
        )}
        
        <p className="mt-2 text-center text-sm text-gray-600">
          Secured by{' '}
          <span className="font-medium text-indigo-600">AIC Amal App</span>
        </p>
      </div>
    </div>
  );
}