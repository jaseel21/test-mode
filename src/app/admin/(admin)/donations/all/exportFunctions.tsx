// src/app/(admin)/donations/all/exportFunctions.tsx

// Define the Donation interface
interface Donation {
  id: string;
  donor: string;
  amount: string;
  type: string;
  status: string;
  date: string;
  email?: string; // Optional fields
  phone?: string;
}

// Define the cleaned Donation interface for export
interface CleanedDonation {
  id: string;
  donor: string;
  amount: string;
  type: string;
  status: string;
  date: string;
}

/**
 * Convert JSON data to CSV format
 */
export const jsonToCSV = (data: CleanedDonation[]): string => {
  if (data.length === 0) return '';

  const headers = [
    'id',
    'donor',
    'amount',
    'type',
    'status',
    'date',
    'email',
    'phone'
  ];

  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header as keyof CleanedDonation]?.toString() || '';
      return `"${value.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

/**
 * Export data as CSV file
 */
export const exportToCSV = (data: Donation[], fileName: string = 'donations-export'): void => {
  const cleanData: CleanedDonation[] = data.map((item) => ({
    id: item.id,
    donor: item.donor,
    amount: item.amount.replace('₹', ''),
    type: item.type,
    status: item.status,
    date: item.date,
    email: item.email || 'N/A',
    phone: item.phone || 'N/A',
  }));

  const csv = jsonToCSV(cleanData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Format currency for PDF display
 */
const formatCurrency = (amount: string): string => {
  try {
    const numericValue = amount.replace(/[₹,\s]/g, '');
    const value = parseFloat(numericValue);
    if (isNaN(value)) return amount;
    return `₹${value.toLocaleString('en-IN')}`;
  } catch {
    return amount;
  }
};

/**
 * Print-friendly export (creates a new window optimized for printing to PDF)
 */
export const printToPDF = (data: Donation[], title: string = 'Donations Report'): void => {
  const cleanData: CleanedDonation[] = data.map((item) => ({
    id: item.id,
    donor: item.donor,
    amount: item.amount,
    type: item.type,
    status: item.status,
    date: item.date ? new Date(item.date).toLocaleDateString() : 'N/A',
  }));

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print this report');
    return;
  }

  let totalAmount = 0;
  try {
    totalAmount = cleanData.reduce((sum, item) => {
      const numAmount = parseFloat(item.amount.replace(/[₹,\s]/g, ''));
      return isNaN(numAmount) ? sum : sum + numAmount;
    }, 0);
  } catch (e) {
    console.error('Error calculating total:', e);
  }

  const tableRows = cleanData
    .map(
      (item, index) => `
      <tr class="${index % 2 === 0 ? 'even-row' : 'odd-row'}">
        <td class="text-center">${index + 1}</td>
        <td class="text-center">${item.id}</td>
        <td>${item.donor}</td>
        <td class="text-right">${formatCurrency(item.amount)}</td>
        <td class="text-center"><span class="type type-${item.type.toLowerCase()}">${item.type}</span></td>
        <td class="text-center"><span class="status status-${item.status.toLowerCase()}">${item.status}</span></td>
        <td class="text-center">${item.date}</td>
      </tr>
    `
    )
    .join('');

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            color: #333;
            line-height: 1.5;
            background-color: #f9fafb;
            padding: 0;
            margin: 0;
          }
          
          .document {
            max-width: 1200px;
            margin: 20px auto;
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
          }
          
          .header {
            padding: 30px 40px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          
          .logo-section {
            display: flex;
            align-items: center;
          }
          
          .logo {
            width: 60px;
            height: 60px;
            background-color: #2e7d32;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
          }
          
          .logo span {
            color: white;
            font-weight: bold;
            font-size: 20px;
          }
          
          .company-info h1 {
            font-size: 22px;
            font-weight: bold;
            color: #2e7d32;
            margin-bottom: 5px;
          }
          
          .company-info p {
            font-size: 14px;
            color: #666;
            margin: 0;
          }
          
          .report-info {
            text-align: right;
          }
          
          .report-info h2 {
            font-size: 18px;
            color: #333;
            margin-bottom: 10px;
          }
          
          .report-info p {
            font-size: 14px;
            color: #666;
            margin: 5px 0;
          }
          
          .summary-section {
            padding: 20px 40px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
          }
          
          .summary-box {
            padding: 15px 20px;
            background-color: #f5f5f5;
            border-radius: 5px;
            width: 48%;
          }
          
          .summary-box h3 {
            font-size: 16px;
            color: #666;
            margin-bottom: 10px;
            font-weight: normal;
          }
          
          .summary-flex {
            display: flex;
            justify-content: space-between;
          }
          
          .summary-item {
            text-align: center;
          }
          
          .summary-value {
            font-size: 22px;
            font-weight: bold;
            color: #2e7d32;
            margin-bottom: 5px;
          }
          
          .summary-label {
            font-size: 14px;
            color: #666;
          }
          
          .table-section {
            padding: 20px 40px 30px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          
          th {
            background-color: #2e7d32;
            color: white;
            font-weight: 500;
            text-align: left;
            padding: 12px 15px;
            font-size: 14px;
          }
          
          td {
            padding: 10px 15px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 14px;
            color: #333;
          }
          
          .text-center {
            text-align: center;
          }
          
          .text-right {
            text-align: right;
          }
          
          .even-row {
            background-color: #f9f9f9;
          }
          
          .odd-row {
            background-color: white;
          }
          
          tr:hover {
            background-color: #f0f0f0;
          }
          
          .status, .type {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 500;
          }
          
          .status-completed {
            background-color: #e8f5e9;
            color: #2e7d32;
            border: 1px solid #a5d6a7;
          }
          
          .status-pending {
            background-color: #fff8e1;
            color: #f57f17;
            border: 1px solid #ffe082;
          }
          
          .status-failed {
            background-color: #ffebee;
            color: #c62828;
            border: 1px solid #ef9a9a;
          }
          
          .type-general {
            color: #1976d2;
          }
          
          .type-yatheem {
            color: #7b1fa2;
          }
          
          .type-hafiz {
            color: #3949ab;
          }
          
          .type-building {
            color: #e65100;
          }
          
          .type-campaign {
            color: #00796b;
          }
          
          .type-institution {
            color: #d84315;
          }
          
          .type-box {
            color: #0097a7;
          }
          
          .footer {
            padding: 20px 40px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          
          .print-controls {
            text-align: center;
            margin: 20px 0 30px;
          }
          
          .print-button {
            background-color: #2e7d32;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 14px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
          }
          
          .print-button:hover {
            background-color: #1b5e20;
          }
          
          @media print {
            body {
              background-color: white;
            }
            
            .document {
              margin: 0;
              box-shadow: none;
              max-width: 100%;
            }
            
            .print-controls {
              display: none;
            }
            
            @page {
              size: A4;
              margin: 0.5cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="document">
          <div class="header">
            <div class="logo-section">
              <div class="logo">
                <span>AIC</span>
              </div>
              <div class="company-info">
                <h1>Akode Islamic Centre</h1>
                <p>Virippadam, Akode, Vazhakkad Via</p>
                <p>Malappuram, Kerala - 673640</p>
              </div>
            </div>
            <div class="report-info">
              <h2>${title}</h2>
              <p>Generated on: ${formattedDate}</p>
              <p>Total Records: ${cleanData.length}</p>
              <p>Report ID: RPT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
            </div>
          </div>
          
          <div class="summary-section">
            <div class="summary-box">
              <h3>Donation Summary</h3>
              <div class="summary-flex">
                <div class="summary-item">
                  <div class="summary-value">${cleanData.length}</div>
                  <div class="summary-label">Total Donations</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">₹${totalAmount.toLocaleString('en-IN')}</div>
                  <div class="summary-label">Total Amount</div>
                </div>
              </div>
            </div>
            <div class="summary-box">
              <h3>Date Range</h3>
              <div class="summary-flex">
                <div class="summary-item">
                  <div class="summary-value">
                    ${cleanData.length > 0 ? 
                      cleanData
                        .map(item => new Date(item.date))
                        .filter(d => !isNaN(d.getTime()))
                        .sort((a, b) => a.getTime() - b.getTime())[0]?.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        }) || 'N/A' 
                      : 'N/A'
                    }
                  </div>
                  <div class="summary-label">From Date</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">
                    ${cleanData.length > 0 ? 
                      cleanData
                        .map(item => new Date(item.date))
                        .filter(d => !isNaN(d.getTime()))
                        .sort((a, b) => b.getTime() - a.getTime())[0]?.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        }) || 'N/A' 
                      : 'N/A'
                    }
                  </div>
                  <div class="summary-label">To Date</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="print-controls">
            <button class="print-button" onclick="window.print();return false;">Print / Save as PDF</button>
          </div>
          
          <div class="table-section">
            <table>
              <thead>
                <tr>
                  <th class="text-center">#</th>
                  <th class="text-center">ID</th>
                  <th>Donor Name</th>
                  <th class="text-right">Amount</th>
                  <th class="text-center">Type</th>
                  <th class="text-center">Status</th>
                  <th class="text-center">Date</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>This document is electronically generated and does not require a signature.</p>
            <p>Akode Islamic Centre | Phone: +91 9745 83 33 99 | Email: info@aicamal.org</p>
          </div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
};

/**
 * Handle export based on selected type
 */
export const handleExport = (data: Donation[], exportType: 'csv' | 'pdf'): void => {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }
  
  if (exportType === 'csv') {
    exportToCSV(data);
  } else {
    printToPDF(data);
  }
};