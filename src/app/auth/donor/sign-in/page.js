'use client';

import { useState, useEffect } from 'react';
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
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaReady, setRecaptchaReady] = useState(isTestMode);

  const router=useRouter()

  

  // Setup reCAPTCHA verifier (only in non-test mode)
  useEffect(() => {
    if (isTestMode) {
      setRecaptchaReady(true); // Skip reCAPTCHA in test mode
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

  // Handle phone number submission
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate phone number format (E.164 format: + followed by digits)
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid phone number in E.164 format (e.g., +12025550123)');
      setLoading(false);
      return;
    }

    try {
      // Check if phone number exists in MongoDB
      const response = await fetch('/api/check-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
        },
        body: JSON.stringify({ phone,role:"Subscriber" }),
      });

      let data;
      try {
        data = await response.json();
        // console.log('Response from /api/check-phone:', data);
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

      // If phone exists, request OTP from Firebase
      console.log('Attempting to send OTP to:', phone);
      const appVerifier = isTestMode ? undefined : window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      console.log('signInWithPhoneNumber result:', result);
      setConfirmationResult(result);
      setOtpSent(true);
      alert('OTP sent successfully!');
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
  
    try {
      console.log('Verifying OTP:', otp);
      const credential = await confirmationResult.confirm(otp);
      console.log('User verified:', credential.user);
  
      // Get Firebase ID token
      const idToken = await credential.user.getIdToken();
      console.log('Firebase ID Token:', idToken);
  
      // Call NextAuth signIn with the Firebase ID token and phone
      const result = await signIn('credentials', {
        redirect: false,
        idToken,
        phone,
        role:"Subscriber",
      });
  
      console.log("Sign-in result:", result);
  
      // **Check if result is valid before using it**
      if (!result || result.error) {
        throw new Error(result?.error || 'Unknown error occurred during sign-in.');
      }
  
      // Redirect on successful login
      
      alert('Login successful!');
      router.push('/subscription/existing');
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(err.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-indigo-600 dark:bg-indigo-700 py-4">
        <h1 className="text-xl font-bold text-center text-white">Subscriber Sign-In</h1>
      </div>
      
      <div className="p-6">
        <div id="recaptcha-container" className="hidden"></div>

        {!otpSent ? (
          // Phone number form
          <form onSubmit={handlePhoneSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+12025550123"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              {isTestMode && (
                <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400">
                  Test mode: Use a test number from Firebase Console
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!isTestMode && !recaptchaReady)}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                ${loading || (!isTestMode && !recaptchaReady) 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking...
                </>
              ) : (!isTestMode && !recaptchaReady) ? 'Loading reCAPTCHA...' : 'Send OTP'}
            </button>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}
          </form>
        ) : (
          // OTP verification form
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enter Verification Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  maxLength={6}
                />
              </div>
              {isTestMode && (
                <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400">
                  Test mode: Use test OTP like 123456
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : 'Verify OTP'}
            </button>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Use different number
              </button>
              <button
                type="button"
                disabled={loading}
                className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 disabled:opacity-50"
              >
                Resend code
              </button>
            </div>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  </div>
  );
}   