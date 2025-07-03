import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Donation from '@/models/Donation';
import nodemailer from 'nodemailer';
import puppeteer, { Browser } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

// Define the Donation interface
interface DonationType {
  _id: string; // String after .lean()
  name?: string;
  email?: string;
  phone?: string;
  amount: string | number; // Required, as used in parseFloat
  type?: string;
  status?: string;
  createdAt?: string | Date; // Can be string or Date
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  receipt_generated?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Parse request body
    const body = await request.json();
    const { donationIds, subject, body: emailBody } = body;
    
    if (!donationIds || !Array.isArray(donationIds) || donationIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing donation IDs' },
        { status: 400 }
      );
    }
    
    // Fetch donations
    const donations = await Donation.find({
      _id: { $in: donationIds },
      email: { $nin: [null, ""] } // Only get donations with non-null, non-empty emails
    }).lean() as unknown as DonationType[];
    
    if (donations.length === 0) {
      return NextResponse.json(
        { error: 'No donations found with valid email addresses' },
        { status: 404 }
      );
    }
    
    // Initialize email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Initialize browser for PDF generation
    let browser: Browser | undefined;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      // Read logo file
      let logoDataUri = '';
      try {
        const logoPath = path.join(process.cwd(), 'public/images/logo.png');
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString('base64');
        logoDataUri = `data:image/png;base64,${logoBase64}`;
      } catch (error) {
        console.warn('Could not load logo image:', error);
      }
      
      // Track success and failures
      let sentCount = 0;
      let failedCount = 0;
      const results: { id: string; status: string; reason?: string }[] = [];
      
      // Send emails with receipts
      for (const donation of donations) {
        try {
          // Only proceed if there's a valid email
          if (!donation.email || donation.email === 'N/A') {
            failedCount++;
            results.push({
              id: donation._id,
              status: 'failed',
              reason: 'No valid email address'
            });
            continue;
          }
          
          // Generate PDF receipt for this donation
          const pdfBuffer = await generateSinglePDF(browser, donation, logoDataUri);
          
          // Format personalized email
          const personalizedSubject = formatEmailContent(subject, donation);
          const personalizedBody = formatEmailContent(emailBody, donation);
          
          // Send email with attachment
          await transporter.sendMail({
            from: `"Akode Islamic Centre" <${process.env.EMAIL_USER}>`,
            to: donation.email,
            subject: personalizedSubject,
            text: personalizedBody,
            attachments: [
              {
                filename: `donation-receipt-${donation._id}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
              }
            ]
          });
          
          // Update receipt_generated flag
          await Donation.findByIdAndUpdate(donation._id, {
            $set: { receipt_generated: true }
          });
          
          sentCount++;
          results.push({
            id: donation._id,
            status: 'success'
          });
        } catch (error) {
          console.error(`Error sending email for donation ${donation._id}:`, error);
          failedCount++;
          results.push({
            id: donation._id,
            status: 'failed',
            reason: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Successfully sent ${sentCount} emails. Failed to send ${failedCount} emails.`,
        sentCount,
        failedCount,
        results
      });
    } catch (error) {
      console.error('Error sending emails:', error);
      return NextResponse.json(
        { error: 'Failed to send emails', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    console.error('Error in email sending API:', error);
    return NextResponse.json(
      { error: 'Failed to process email request', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Function to generate a single PDF receipt
async function generateSinglePDF(browser: Browser, donation: DonationType, logoDataUri: string = ''): Promise<Buffer> {
  try {
    const page = await browser.newPage();
    
    // Format date
    const receiptDate = donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : 'N/A';
    
    // Generate donation ID
    const donationId = donation.razorpayOrderId || `DON-${donation._id.toString().slice(-6).toUpperCase()}`;
    
    // Format amount
    const amount = `₹${parseFloat(String(donation.amount)).toLocaleString('en-IN')}`;
    
    // Create HTML content for receipt
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Donation Receipt</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background: #f9f9f9;
          }
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: white;
          }
          .receipt-header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .logo-section {
            display: flex;
            align-items: center;
          }
          .logo {
            width: 50px;
            height: 50px;
            margin-right: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo-text {
            color: white;
            font-weight: bold;
            font-size: 18px;
            background-color: #10b981;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .org-name {
            font-size: 20px;
            font-weight: bold;
            color: #10b981;
          }
          .org-subtitle {
            font-size: 14px;
            color: #666;
          }
          .receipt-id {
            text-align: right;
          }
          .receipt-id p {
            margin: 5px 0;
          }
          .receipt-id .label {
            color: #666;
            font-size: 14px;
          }
          .receipt-id .value {
            font-size: 18px;
            font-weight: bold;
          }
          .receipt-id .date {
            font-size: 14px;
            color: #666;
          }
          .receipt-body {
            display: flex;
            margin: 20px 0;
          }
          .info-section {
            flex: 1;
            padding-right: 20px;
          }
          .info-header {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #10b981;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 5px;
          }
          .info-row {
            margin-bottom: 10px;
          }
          .info-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 3px;
          }
          .info-value {
            font-size: 16px;
          }
          .amount {
            font-size: 18px;
            font-weight: bold;
            color: #10b981;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: 500;
            border-radius: 4px;
          }
          .badge-completed {
            background-color: #d1fae5;
            color: #047857;
          }
          .badge-type {
            background-color: #e0e7ff;
            color: #4338ca;
          }
          .receipt-footer {
            text-align: center;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
            margin-top: 20px;
            font-size: 14px;
            color: #666;
          }
          .receipt-note {
            font-style: italic;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
            <div class="logo-section">
              <div class="logo">
                ${logoDataUri ? 
                  `<img src="${logoDataUri}" alt="AIC Logo" width="50" height="50" style="border-radius: 50%;">` : 
                  `<div class="logo-text">AIC</div>`
                }
              </div>
              <div>
                <div class="org-name">Akode Islamic Centre</div>
                <div class="org-subtitle">AIC Amal Donation Receipt</div>
              </div>
            </div>
            <div class="receipt-id">
              <p class="label">Receipt No</p>
              <p class="value">${donationId}</p>
              <p class="date">${receiptDate}</p>
              <p>
                <span class="badge badge-completed">${donation.status || 'Completed'}</span>
              </p>
            </div>
          </div>
          
          <div class="receipt-body">
            <div class="info-section">
              <div class="info-header">Donor Information</div>
              <div class="info-row">
                <div class="info-label">Name</div>
                <div class="info-value">${donation.name || 'Anonymous'}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Email</div>
                <div class="info-value">${donation.email || 'N/A'}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Phone</div>
                <div class="info-value">${donation.phone || 'N/A'}</div>
              </div>
            </div>
            
            <div class="info-section">
              <div class="info-header">Donation Details</div>
              <div class="info-row">
                <div class="info-label">Amount</div>
                <div class="info-value amount">${amount}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Type</div>
                <div class="info-value">
                  <span class="badge badge-type">${donation.type || 'General'}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">Payment ID</div>
                <div class="info-value">${donation.razorpayPaymentId || 'N/A'}</div>
              </div>
            </div>
          </div>
          
          <div class="receipt-footer">
            <div class="receipt-note">Thank you for your generous contribution!</div>
            <p>Akode Islamic Centre | Oorkadavu, Malappuram, Kerala</p>
            <p>This receipt is electronically generated and is valid without signature.</p>
            <p>For any inquiries, please contact: info@aicamal.org</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF and convert to Buffer
    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    const pdfBuffer = Buffer.from(pdfData);
    
    await page.close();
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating single PDF:', error);
    throw error;
  }
}

// Function to format email content with placeholders
function formatEmailContent(content: string, donation: DonationType): string {
  if (!content) return '';
  
  // Generate donation ID
  const donationId = donation.razorpayOrderId || `DON-${donation._id.toString().slice(-6).toUpperCase()}`;
  
  // Format amount
  const amount = `₹${parseFloat(String(donation.amount)).toLocaleString('en-IN')}`;
  
  // Format date
  const donationDate = donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : 'N/A';
  
  // Replace placeholders
  return content
    .replace(/\{name\}/g, donation.name || 'Donor')
    .replace(/\{amount\}/g, amount)
    .replace(/\{id\}/g, donationId)
    .replace(/\{date\}/g, donationDate)
    .replace(/\{type\}/g, donation.type || 'General')
    .replace(/\{email\}/g, donation.email || 'N/A')
    .replace(/\{phone\}/g, donation.phone || 'N/A');
}