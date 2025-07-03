// src/app/api/donations/generate-receipts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Donation from '@/models/Donation';
import { registerFont } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';
import { stringify } from 'csv-stringify/sync';

// Define the Donation interface to replace `any`
interface DonationData {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  amount: number | string;
  type?: string;
  status?: string;
  createdAt?: Date | string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  receipt_generated?: boolean;
}

// Register fonts for canvas (kept in case canvas is used elsewhere)
try {
  registerFont(path.join(process.cwd(), 'public/fonts/Roboto-Regular.ttf'), { family: 'Roboto' });
  registerFont(path.join(process.cwd(), 'public/fonts/Roboto-Bold.ttf'), { family: 'Roboto', weight: 'bold' });
} catch (error) {
  console.warn('Could not register fonts:', error);
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Parse request body
    const body = await request.json();
    const { donationIds, format = 'pdf' } = body;

    if (!donationIds || !Array.isArray(donationIds) || donationIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing donation IDs' },
        { status: 400 }
      );
    }

    // Validate format
    if (!['pdf', 'image', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be one of: pdf, image, csv' },
        { status: 400 }
      );
    }

    // Fetch donations
    const donations = await Donation.find({
      _id: { $in: donationIds },
    }).lean() as unknown as DonationData[];

    if (donations.length === 0) {
      return NextResponse.json(
        { error: 'No donations found with the provided IDs' },
        { status: 404 }
      );
    }

    // Generate receipts based on format
    if (format === 'csv') {
      return generateCSVReceipt(donations);
    } else if (format === 'image') {
      return generateImageReceipt(donations);
    } else {
      return generatePDFReceipt(donations);
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate receipts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Function to generate CSV receipt
async function generateCSVReceipt(donations: DonationData[]) {
  try {
    // Format donations for CSV export
    const csvData = donations.map((donation) => {
      // Format date
      const receiptDate = donation.createdAt
        ? new Date(donation.createdAt).toLocaleDateString()
        : 'N/A';

      // Generate donation ID
      const donationId =
        donation.razorpayOrderId ||
        `DON-${donation._id.toString().slice(-6).toUpperCase()}`;

      return {
        'Receipt ID': donationId,
        'Donor Name': donation.name || 'Anonymous',
        Email: donation.email || 'N/A',
        Phone: donation.phone || 'N/A',
        Amount: `₹${parseFloat(donation.amount.toString()).toLocaleString('en-IN')}`,
        Type: donation.type || 'General',
        Status: donation.status || 'N/A',
        Date: receiptDate,
        'Transaction ID': donation.razorpayPaymentId || 'N/A',
      };
    });

    // Convert to CSV string
    const csvString = stringify(csvData, {
      header: true,
      columns: [
        'Receipt ID',
        'Donor Name',
        'Email',
        'Phone',
        'Amount',
        'Type',
        'Status',
        'Date',
        'Transaction ID',
      ],
    });

    // Update receipt_generated status for all donations
    const donationIds = donations.map((d) => d._id);
    await Donation.updateMany(
      { _id: { $in: donationIds } },
      { $set: { receipt_generated: true } }
    );

    // Create and return the CSV file
    return new NextResponse(csvString, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=donation-receipts-${new Date()
          .toISOString()
          .split('T')[0]}.csv`,
      },
    });
  } catch (error) {
    console.error('Error generating CSV receipt:', error);
    throw error;
  }
}

// Function to generate PDF receipt
async function generatePDFReceipt(donations: DonationData[]) {
  let browser;
  try {
    // Read logo file
    let logoDataUri = '';
    try {
      const logoPath = path.join(process.cwd(), 'public/images/logo.png');
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = logoBuffer.toString('base64');
      logoDataUri = `data:image/png;base64,${logoBase64}`;
    } catch (error) {
      console.warn('Could not load logo image:', error);
      // We'll continue without the logo image if it fails to load
    }

    // Launch a browser instance
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Create HTML content for all receipts
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Donation Receipts</title>
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
            padding: 40px 0;
          }
          .receipt {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
            padding: 30px;
            page-break-after: always;
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
          .badge-pending {
            background-color: #fef3c7;
            color: #92400e;
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
          .qr-code {
            width: 100px;
            height: 100px;
            background-color: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px auto;
            font-size: 10px;
            color: #666;
          }
          .receipt-note {
            font-style: italic;
            margin-bottom: 10px;
          }
          @media print {
            body {
              background: white;
            }
            .receipt {
              box-shadow: none;
              margin: 0;
              padding: 30px 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          ${donations.map((donation) => formatDonationToHTML(donation, logoDataUri)).join('')}
        </div>
      </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    // Update receipt_generated status for all donations
    const donationIds = donations.map((d) => d._id);
    await Donation.updateMany(
      { _id: { $in: donationIds } },
      { $set: { receipt_generated: true } }
    );

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=donation-receipts-${new Date()
          .toISOString()
          .split('T')[0]}.pdf`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF receipt:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Function to generate Image receipt
async function generateImageReceipt(donations: DonationData[]) {
  let browser;
  try {
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

    // For simplicity, we'll just take the first donation for image generation
    const donation = donations[0];

    // Launch a browser instance
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set viewport for image capture
    await page.setViewport({
      width: 800,
      height: 600,
      deviceScaleFactor: 2, // Higher resolution
    });

    // Create HTML content for receipt with similar styling as the PDF version
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
            width: 800px;
            height: 600px;
            margin: 0;
            padding: 0;
            background: white;
            position: relative;
            overflow: hidden;
          }
          .receipt {
            padding: 40px;
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
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(16, 185, 129, 0.05);
            font-weight: bold;
            z-index: 1;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="watermark">AIC AMAL</div>
          <div class="receipt">
            ${formatDonationToHTML(donation, logoDataUri)}
          </div>
        </div>
      </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate image
    const imageBuffer = await page.screenshot({
      type: 'png',
      fullPage: false,
      omitBackground: false,
    });

    // Update receipt_generated status for all donations
    const donationIds = donations.map((d) => d._id);
    await Donation.updateMany(
      { _id: { $in: donationIds } },
      { $set: { receipt_generated: true } }
    );

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename=donation-receipt-${donation._id}.png`,
      },
    });
  } catch (error) {
    console.error('Error generating image receipt:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Helper function to format a donation to HTML for receipts with logo support
function formatDonationToHTML(donation: DonationData, logoDataUri: string = ''): string {
  // Format date
  const receiptDate = donation.createdAt
    ? new Date(donation.createdAt).toLocaleDateString()
    : 'N/A';

  // Generate donation ID
  const donationId =
    donation.razorpayOrderId || `DON-${donation._id.toString().slice(-6).toUpperCase()}`;

  // Format amount
  const amount = `₹${parseFloat(donation.amount.toString()).toLocaleString('en-IN')}`;

  return `
    <div class="receipt">
      <div class="receipt-header">
        <div class="logo-section">
          <div class="logo">
            ${
              logoDataUri
                ? `<img src="${logoDataUri}" alt="AIC Logo" width="50" height="50" style="border-radius: 50%;">`
                : `<div class="logo-text">AIC</div>`
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
      </div>
    </div>
  `;
}