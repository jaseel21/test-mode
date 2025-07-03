// src/components/users-section/subscription/types.ts

export interface SubscriptionFormProps {
    subscriptionType: "auto" | "manual";
    setSubscriptionType: (type: "auto" | "manual" | null) => void;
    phoneNumber: string;
    setPhoneNumber: (number: string) => void;
    handleSubscriptionSubmit: (e: React.FormEvent) => Promise<void>;
    isLoading: boolean;
    donationTypes: DonationType[];
}

interface Payment {
    id: string;
    amount: number;
    date: Date;
}
export interface UserDashboardProps {
    user: {
        name: string;
        phoneNumber: string;
        email?: string;
        joinedDate: string;
        totalDonations: number;
    };
    userSubscriptions: import("../types").Subscription[];
    paymentHistory: Payment[];
    isLoading: boolean;
    handleMakePayment: (subscription: import("../types").Subscription) => Promise<void>;
    handleCancelAutoPayment: (subscription: import("../types").Subscription) => Promise<void>;
    setLoginStep: (step: "phone" | "otp" | "dashboard") => void;
    setUserMode: (mode: "new" | "existing") => void;
    setSubscriptionType: (type: "auto" | "manual" | null) => void;
}

import { Subscription as MainSubscription } from "../types";

// Re-export the main Subscription type
export type Subscription = MainSubscription;

// Define component props
export interface SubscriptionFormProps {
    subscriptionType: "auto" | "manual";
    setSubscriptionType: (type: "auto" | "manual" | null) => void;
    phoneNumber: string;
    setPhoneNumber: (number: string) => void;
    handleSubscriptionSubmit: (e: React.FormEvent) => Promise<void>;
    isLoading: boolean;
    donationTypes: DonationType[];
}

// src/components/users-section/types.ts

export interface DonationType {
    id: number;
    name: string;
}

//   export interface Subscription {
//     id: number;
//     type: "auto" | "manual";
//     donationType: string;
//     amount: number;
//     period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
//     phoneNumber: string;
//     nextPaymentDue: string;
//     createdAt?: string;
//     lastPaymentDate?: string;
//     status?: "active" | "paused" | "cancelled";
//   }

// Add Campaign interface
export interface Campaign {
    id: number;
    title: string;
    description: string;
    type: 'fund' | 'initiative'; // 'fund' for money donations, 'initiative' for goods/services
    target?: number;
    raised?: number;
    deadline?: string;
    image?: string;
    category?: string;
    organizer?: string;
    status?: 'active' | 'completed' | 'paused';
    createdAt?: string;
}