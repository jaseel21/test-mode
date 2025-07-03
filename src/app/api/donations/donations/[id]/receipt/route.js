// src/app/api/donations/dashboard/donations/[id]/receipt/route.js
import { NextResponse } from 'next/server';
import { donationService } from '@/services/donationService';

export async function POST(request, { params }) {
  try {
    const { id } = params?.id ? params : { id: null };
    
    if (!id) {
      return NextResponse.json(
        { error: 'Donation ID is required' },
        { status: 400 }
      );
    }
    
    // Get the donation details
    const donation = await donationService.getDonationById(id);
    
    // Instead of using PDFKit which has font issues, we'll generate an HTML receipt
    // and convert it to a PDF using browser capabilities
    const htmlContent = generateReceiptHTML(donation);
    
    // Return the HTML content with proper headers for the client to handle
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      }
    });
  } catch (error) {
    console.error(`Error generating receipt:`, error);
    
    // Determine appropriate status code
    const statusCode = error.message?.includes('not found') ? 404 : 500;
    
    return NextResponse.json(
      { 
        error: `Failed to generate receipt: ${error.message}`,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}

function generateReceiptHTML(donation) {
  const receiptDate = donation.date ? new Date(donation.date).toLocaleDateString() : new Date().toLocaleDateString();
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Donation Receipt - ${donation.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .receipt-container {
          max-width: 800px;
          margin: 20px auto;
          padding: 30px;
          background-color: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #2e7d32;
          margin-bottom: 20px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2e7d32;
          margin-bottom: 5px;
        }
        .title {
          font-size: 20px;
          margin-bottom: 5px;
        }
        .subtitle {
          font-size: 14px;
          color: #666;
        }
        .section {
          margin: 20px 0;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #2e7d32;
        }
        .info-row {
          display: flex;
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          width: 150px;
        }
        .info-value {
          flex: 1;
        }
        .status {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: bold;
        }
        .status-completed {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        .status-pending {
          background-color: #fff8e1;
          color: #f57c00;
        }
        .amount {
          font-size: 18px;
          font-weight: bold;
          color: #2e7d32;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
        .print-button {
          background-color: #2e7d32;
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 14px;
          cursor: pointer;
          border-radius: 4px;
          margin: 20px auto;
          display: block;
        }
        @media print {
          .print-button {
            display: none;
          }
          body {
            background-color: #fff;
          }
          .receipt-container {
            box-shadow: none;
            margin: 0;
            padding: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <div class="logo">AIC AMAL</div>
          <div class="title">DONATION RECEIPT</div>
          <div class="subtitle">AKODE ISLAMIC CENTRE</div>
        </div>
        
        <div class="section">
          <div class="section-title">RECEIPT INFORMATION</div>
          <div class="info-row">
            <div class="info-label">Receipt No:</div>
            <div class="info-value">${donation.id}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Date:</div>
            <div class="info-value">${receiptDate}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Status:</div>
            <div class="info-value">
              <span class="status status-${donation.status.toLowerCase()}">${donation.status}</span>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">DONOR INFORMATION</div>
          <div class="info-row">
            <div class="info-label">Name:</div>
            <div class="info-value">${donation.donor}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Email:</div>
            <div class="info-value">${donation.email}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Phone:</div>
            <div class="info-value">${donation.phone}</div>
          </div>
          ${donation.donor_details?.location ? `
          <div class="info-row">
            <div class="info-label">Location:</div>
            <div class="info-value">${donation.donor_details.location}, ${donation.donor_details.district || ''}</div>
          </div>
          ` : ''}
        </div>
        
        <div class="section">
          <div class="section-title">DONATION DETAILS</div>
          <div class="info-row">
            <div class="info-label">Amount:</div>
            <div class="info-value"><span class="amount">${donation.amount}</span></div>
          </div>
          <div class="info-row">
            <div class="info-label">Type:</div>
            <div class="info-value">${donation.type}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Payment Method:</div>
            <div class="info-value">${donation.paymentMethod || 'Online Payment'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Transaction ID:</div>
            <div class="info-value">${donation.transactionId}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your generous contribution!</p>
          <p>Akode Islamic Centre | Phone: +91 9745 83 33 99 | Email: info@aicamal.org</p>
          <p>This receipt is electronically generated and is valid without signature.</p>
        </div>
      </div>
      
      <button class="print-button" onclick="window.print(); return false;">Print Receipt</button>
      
      <script>
        // Auto-trigger print dialog when the page loads
        window.onload = function() {
          // Small delay to ensure styling is applied
          setTimeout(() => {
            window.print();
          }, 500);
        }
      </script>
    </body>
    </html>
  `;
}