// src/lib/receipt-pdf.ts
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ReceiptData {
  _id: string;
  amount: number;
  name: string;
  phone: string;
  type: string;
  district: string;
  panchayat: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  instituteId?: string;
  createdAt: string;
}

export const generatePDF = async (receipt: ReceiptData) => {
  // Create a hidden container for the HTML receipt
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px"; // Off-screen
  container.style.width = "210mm"; // A4 width
  container.style.padding = "20mm";
  container.style.backgroundColor = "#fff";
  document.body.appendChild(container);

  // HTML receipt template with inline CSS
  container.innerHTML = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
      <!-- Header -->
      <div style="text-align: center; border-bottom: 2px solid #4a90e2; padding-bottom: 10px;">
        <h1 style="font-size: 24px; color: #4a90e2; margin: 0;">Donation Receipt</h1>
        <p style="font-size: 14px; color: #666; margin: 5px 0;">
          AIC Amal App System
        </p>
      </div>

      <!-- Date and Receipt Number -->
      <div style="display: flex; justify-content: space-between; margin-top: 20px;">
        <p style="font-size: 14px; margin: 0;">
          <strong>Date:</strong> ${new Date(receipt.createdAt).toLocaleDateString()}
        </p>
        <p style="font-size: 14px; margin: 0;">
          <strong>Receipt No:</strong> ${receipt._id}
        </p>
      </div>

      <!-- Donor Details -->
      <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px;">
        <h2 style="font-size: 18px; color: #4a90e2; margin: 0 0 10px 0;">Donor Information</h2>
        <p style="font-size: 14px; margin: 5px 0;">
          <strong>Name:</strong> ${receipt.name}
        </p>
        <p style="font-size: 14px; margin: 5px 0;">
          <strong>Phone:</strong> ${receipt.phone}
        </p>
        <p style="font-size: 14px; margin: 5px 0;">
          <strong>Location:</strong> ${
            receipt.panchayat ? `${receipt.panchayat}, ${receipt.district}` : receipt.district
          }
        </p>
      </div>

      <!-- Donation Details -->
      <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px;">
        <h2 style="font-size: 18px; color: #4a90e2; margin: 0 0 10px 0;">Donation Details</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="background-color: #e6f0fa;">
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${receipt.amount.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Type</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${receipt.type}</td>
          </tr>
          <tr style="background-color: #e6f0fa;">
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Payment ID</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${receipt.razorpayPaymentId}</td>
          </tr>
         
          ${
            receipt.instituteId
              ? `<tr style="background-color: #e6f0fa;">
                  <td style="padding: 8px;"><strong>Institute ID</strong></td>
                  <td style="padding: 8px;">${receipt.instituteId}</td>
                </tr>`
              : ""
          }
        </table>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px;">
        <p style="font-size: 12px; color: #666; margin: 0;">
          Thank you for your generous contribution!
        </p>
        <p style="font-size: 12px; color: #666; margin: 5px 0;">
          This is an auto-generated receipt. For queries, contact support@aicdonations.org
        </p>
      </div>
    </div>
  `;

  // Convert HTML to canvas and then to PDF
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add first page
    doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Handle multi-page if content exceeds one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    doc.save(`receipt_${receipt._id}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};