import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  Auth
} from 'firebase/auth';

// Firebase configuration - replace with your own
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Types for window extension
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
  }
}

// Check if we're in a test mode
const isTestMode = process.env.NEXT_PUBLIC_FIREBASE_TEST_MODE === 'true';

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  auth.useDeviceLanguage();

  // Enable test mode if specified
  if (isTestMode && typeof window !== 'undefined') {
    try {
      auth.settings.appVerificationDisabledForTesting = true;
      console.log('Firebase test mode enabled');
    } catch (err) {
      console.error('Error setting appVerificationDisabledForTesting:', err);
    }
  }
} else {
  app = getApps()[0];
  auth = getAuth(app);
}

// Functions for OTP verification

// Setup reCAPTCHA verifier
export const setupRecaptcha = async (containerId: string = 'recaptcha-container'): Promise<boolean> => {
  if (isTestMode) return true;
  
  try {
    if (typeof window !== 'undefined') {
      // Clear previous recaptcha instance if it exists
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      
      const containerElement = document.getElementById(containerId);
      if (!containerElement) {
        console.error(`reCAPTCHA container element not found: ${containerId}`);
        return false;
      }
      
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerElement, {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified');
          return true;
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          return false;
        },
        'error-callback': (error: Error) => {
          console.error('reCAPTCHA error:', error);
          return false;
        }
      });
      
      await window.recaptchaVerifier.render();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error setting up reCAPTCHA:', error);
    return false;
  }
};

// Send OTP to phone number
export const sendOTP = async (phoneNumber: string): Promise<ConfirmationResult | null> => {
  try {
    // Make sure phone number is in E.164 format (with +91 prefix)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    const appVerifier = isTestMode 
      ? undefined 
      : window.recaptchaVerifier as RecaptchaVerifier;
      
    return await signInWithPhoneNumber(auth, formattedPhone, appVerifier as RecaptchaVerifier);
  } catch (error) {
    console.error('Error sending OTP:', error);
    return null;
  }
};

// Clear reCAPTCHA
export const clearRecaptcha = (): void => {
  if (typeof window !== 'undefined' && window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
};

export { auth, isTestMode };