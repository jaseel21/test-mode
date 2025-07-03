// src/components/causes/types.ts
import { ReactNode } from "react";

export interface CauseType {
  id: number;
  type: "Yatheem" | "Hafiz" | "Building";
  name: string;
  description: string;
  icon: ReactNode;
  benefits: string[];
}

export interface CauseFormData {
  fullName: string;
  phoneNumber: string;
  donationType:"Yatheem" | "Hafiz" | "Building";
  email: string;
  location: string;
  amount: number;
}