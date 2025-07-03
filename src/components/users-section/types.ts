import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone: string;
      role: string;
    } & DefaultSession["user"];
  }
}

export type SponsorshipType = "Yatheem" | "Hafiz";

export interface DonationType {
  id: number;
  name: string;
}

export interface Box {
  id: number;
  serialNumber: string;
  amountDue: number;
  name: string;
  totalAmount: number;
  paymentStatus: string;
  currentPeriod: string;
  lastPayment: string;
  status: "active" | "dead" | "overdue";
}

export interface UserData {
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
}

export interface Donation {
  subscriptionId: string;
  name: string;
  phone: string;
  amount: string;
  period: string;
  paymentStatus: string;
  paymentDate: string;
}

export interface Payment {
  _id: string;
  razorpayOrderId: string;
  amount: number;
  district: string;
  donorId: string;
  method: string;
  name: string;
  panchayat: string;
  paymentDate: string;
  paymentStatus: string;
  period: string;
  phone: string;
  razorpayPaymentId: string;
  razorpaySubscriptionId: string;
  status: string;
  subscriptionId: string;
  type: string;
}

export interface PaymentHistory {
  id: number;
  date: string;
  amount: number;
  donationType: string;
  status: string;
  receiptNo: string;
}

export interface SubscriptionData {
  _id: string;
  donorId: string;
  name: string;
  phone: string;
  email?: string;
  amount: string;
  period: string;
  type: string;
  district?: string;
  panchayat?: string;
  donationType?: string;
  method?: string;
  createdAt?: string;
}

export interface Subscription {
  _id: string;
  razorpaySubscriptionId: string;
  id: number;
  type: "auto" | "manual";
  donationType: string;
  amount: number;
  period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  phoneNumber: string;
  nextPaymentDue: string;
  createdAt: string;
  lastPaymentDate: string;
  status: "active" | "paused" | "cancelled";
}

export interface User {
  name: string;
  phoneNumber: string;
  email?: string;
  joinedDate: string;
  totalDonations: number;
}

export interface Campaign {
  featuredImageUrl: string;
  [x: number]: string;
  id: number;
  title: string;
  description: string;
  raised: number;
  goal: number;
  endDate: string;
  type: "fundraising" | "physical" | "fixedamount";
  image: string;
  isInfinite: boolean;
  area?: number;
  rate?: number;
}

export interface BaseOption {
  duration: string;
  amount: number;
  description: string;
}

export interface EducationOption extends BaseOption {
  withEducation: number;
}

export interface ActiveOption extends BaseOption {
  finalAmount: number;
  includesEducation: boolean;
  withEducation?: number;
}

export const sponsorshipData: Record<SponsorshipType, (BaseOption | EducationOption)[]> = {
  Yatheem: [
    { duration: "One Year", amount: 30000, description: "Provide full annual support for a child in need." },
    { duration: "6 Months", amount: 15000, description: "Half-year support for essential care and education." },
    { duration: "1 Month", amount: 2500, description: "Monthly support to cover basic needs." },
  ],
  Hafiz: [
    { duration: "One Year", amount: 30000, withEducation: 50000, description: "Support the religious education of a student for a full year." },
    { duration: "6 Months", amount: 15000, withEducation: 25000, description: "Half-year support for a Hafiz student's development." },
    { duration: "1 Month", amount: 2500, withEducation: 5000, description: "Monthly sponsorship for Hafiz programs." },
  ],
};

export function hasEducation(option: BaseOption): option is EducationOption {
  return "withEducation" in option;
}

export interface Transaction {
  id: string;
  boxId: number;
  boxSerialNumber: string;
  amount: number;
  paymentMethod: "upi" | "card" | "netbanking";
  status: "success" | "pending" | "failed";
  timestamp: string;
}

export interface BoxData {
  _id: string;
  name: string;
  mobileNumber: string;
  district: string;
  panchayath: string;
  amount?: string | number;
  phone?: string;
  boxId?: string;
  type?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
}

export type PaymentMethod = "upi" | "card" | "netbanking";
export type PageState = "verification" | "boxList" | "payment" | "history" | "editProfile";
export type VerificationStep = "phone" | "otp";
export type PaymentStep = "details" | "method" | "processing" | "success";