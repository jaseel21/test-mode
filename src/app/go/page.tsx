// 'use client';

// import { useEffect } from 'react';

// const RedirectPage = () => {
//   useEffect(() => {
//     const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

//     const androidLink = 'https://play.google.com/store/apps/details?id=com.aic.amal';
//     const iosLink = 'https://apps.apple.com/us/app/aic-amal/id6743961924';
//     const webLink = 'https://www.aicamal.app';

//     if (/android/i.test(userAgent)) {
//       window.location.href = androidLink;
//     } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
//       window.location.href = iosLink;
//     } else {
//       window.location.href = webLink;
//     }
//   }, []);

//   return (
//     <main className="flex min-h-screen items-center justify-center bg-white text-black text-center px-4">
//       <div>
//         <h1 className="text-xl font-semibold mb-2">Redirecting...</h1>
//         <p>Please wait while we open the correct version of the app for your device.</p>
//       </div>
//     </main>
//   );
// };

// export default RedirectPage;

'use client';

import { useEffect } from 'react';

// Extend Window interface for TypeScript
interface ExtendedWindow extends Window {
  opera?: unknown;
  MSStream?: unknown;
}

const RedirectPage = () => {
  useEffect(() => {
    const redirectUser = () => {
      const { navigator, opera } = window as ExtendedWindow;
      const userAgent = navigator.userAgent || navigator.vendor || opera || '';

      const androidLink = 'https://play.google.com/store/apps/details?id=com.aic.amal';
      const iosLink = 'https://apps.apple.com/us/app/aic-amal/id6743961924';
      const webLink = 'https://www.aicamal.app';

      if (/android/i.test(userAgent as string)) {
        window.location.replace(androidLink);
      } else if (/iPad|iPhone|iPod/.test(userAgent as string) && !('MSStream' in window)) {
        window.location.replace(iosLink);
      } else {
        window.location.replace(webLink);
      }
    };

    redirectUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin animate-reverse"></div>
          </div>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Launching Your Experience
          </h1>
          <p className="mt-2 text-gray-300 text-sm font-medium">
            Redirecting to the optimal version for your device...
          </p>
          <div className="mt-4 text-gray-400 text-xs">
            Powered by <span className="font-semibold text-white">AIC Amal</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-reverse {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
};

export default RedirectPage;