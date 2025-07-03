"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ReceiptDetails from '@/components/users-section/receipts/ReceiptDetails';
import { Receipt } from '@/components/users-section/receipts/ReceiptCard';
import EmptyState from '@/components/users-section/receipts/EmptyState';

export default function ReceiptDetailPage() {
  const params = useParams();
  const receiptId = params.id as string;
  
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchReceipt = async () => {
      if (!receiptId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/receipts/${receiptId}`,{
          headers: {
            'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch receipt details');
        }
        
        const data = await response.json();
        setReceipt(data.receipt);
      } catch (err) {
        console.error('Error fetching receipt:', err);
        setError('Failed to load receipt details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReceipt();
  }, [receiptId]);
  
  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">Receipt Details</h1>
          <p className="text-xl text-indigo-200 max-w-3xl">
            View your donation receipt details and download for your records.
          </p>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-16 px-6 bg-gray-50 min-h-screen">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="max-w-3xl mx-auto">
              <EmptyState 
                message="Failed to load receipt details" 
                actionText="Go Back" 
                onAction={() => window.history.back()}
              />
            </div>
          ) : receipt ? (
            <ReceiptDetails receipt={receipt} />
          ) : (
            <div className="max-w-3xl mx-auto">
              <EmptyState 
                message="Receipt not found" 
                actionText="Go Back" 
                onAction={() => window.history.back()}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}