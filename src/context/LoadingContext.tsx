"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
  FC,
} from "react";

interface LoadingContextType {
  isLoading: boolean;
  progress: number;
  message: string | null;
  startLoading: (msg?: string) => void;
  stopLoading: () => void;
  setLoadingState: (state: boolean, msg?: string) => void;
  queueLoading: (key: string, msg?: string) => void;
  dequeueLoading: (key: string) => void;
  isLoadingKey: (key: string) => boolean;
  setProgress: (value: number) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
  loadingComponent?: ReactNode;
}

const LoadingProvider: FC<LoadingProviderProps> = ({ children, loadingComponent }) => {
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);

  const startLoading = useCallback((msg?: string) => {
    setLoadingKeys((prev) => new Set(prev).add("global"));
    setMessage(msg || "Loading...");
    setProgress(0);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingKeys((prev) => {
      const newSet = new Set(prev);
      newSet.delete("global");
      return newSet;
    });
    setMessage(null);
    setProgress(0);
  }, []);

  const setLoadingState = useCallback((state: boolean, msg?: string) => {
    setLoadingKeys((prev) => {
      const newSet = new Set(prev);
      if (state) {
        newSet.add("global");
      } else {
        newSet.delete("global");
      }
      return newSet;
    });
    setMessage(state ? msg || "Loading..." : null);
    setProgress(0); // ✅ Fixed
  }, []);

  const queueLoading = useCallback((key: string, msg?: string) => {
    setLoadingKeys((prev) => new Set(prev).add(key));
    setMessage(msg || message || "Processing...");
  }, [message]);

  const dequeueLoading = useCallback((key: string) => {
    setLoadingKeys((prev) => {
      const newSet = new Set(prev);
      newSet.delete(key);
      if (newSet.size === 0) setMessage(null);
      return newSet;
    });
  }, []);

  const isLoadingKey = useCallback((key: string) => loadingKeys.has(key), [loadingKeys]);

  const handleSetProgress = useCallback((value: number) => {
    setProgress(Math.min(Math.max(value, 0), 100));
  }, []);

  const isLoading = loadingKeys.size > 0;

  const contextValue = useMemo(
    () => ({
      isLoading,
      progress,
      message,
      startLoading,
      stopLoading,
      setLoadingState,
      queueLoading,
      dequeueLoading,
      isLoadingKey,
      setProgress: handleSetProgress,
    }),
    [
      isLoading,
      progress,
      message,
      startLoading,
      stopLoading,
      setLoadingState,
      queueLoading,
      dequeueLoading,
      isLoadingKey,
      handleSetProgress,
    ]
  );

  const defaultLoadingUI = (
    <div
      className={`fixed inset-0 z-[9999] bg-indigo-50/90 flex items-center justify-center transition-opacity duration-300 ease-in-out ${
        isLoading ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={!isLoading}
      aria-live="polite"
      aria-busy={isLoading}
      role="status"
    >
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/20 to-transparent animate-ping" />
        <div className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-violet-600 animate-spin shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
        <div className="absolute inset-2 rounded-full bg-white animate-pulse" />
        {progress > 0 && (
          <svg className="absolute inset-0 w-full h-full">
            <circle
              className="text-violet-600"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              r="30"
              cx="40"
              cy="40"
              strokeDasharray={`${(progress / 100) * 188} 188`}
              strokeDashoffset="0"
              transform="rotate(-90 40 40)"
            />
          </svg>
        )}
        {message && (
          <div className="absolute top-full mt-4 text-sm text-indigo-800 font-medium tracking-wide">
            {message}
          </div>
        )}
        <span className="sr-only">{message || "Loading, please wait..."}</span>
      </div>
    </div>
  );

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      {isLoading && (loadingComponent || defaultLoadingUI)}
    </LoadingContext.Provider>
  );
};

const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error("useLoading must be used within a LoadingProvider");
  return context;
};

const withLoading = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const WithLoading = (props: P) => (
    <WrappedComponent {...props} loading={useLoading()} />
  );
  WithLoading.displayName = `WithLoading(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
  return WithLoading;
};

export { LoadingProvider, useLoading, withLoading };
