// src/app/api/donations/receipt/route.js
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const {
      donationId,
      amount,
      name,
      phone,
      type,
      district,
      panchayat,
      paymentId,
      orderId,
    } = await req.json();

    // Create a new PDF document
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]); // A4 size in points
    const helvetica = await doc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();
    const margin = 50;
    let yPosition = height - margin;

    // Helper function to draw text
    const drawText = (text, options = {}) => {
      const { size = 12, font = helvetica, bold = false, x = margin } = options;
      page.drawText(text, {
        x,
        y: yPosition,
        size,
        font: bold ? helveticaBold : font,
        color: rgb(0, 0, 0),
      });
      yPosition -= size + 5;
    };

    // Header
    drawText("aic-amal-donation-reccipt", { size: 20, bold: true, x: width / 2 - 70 });
    yPosition -= 20;

    // Metadata
    drawText(`Donation ID: ${donationId}`);
    drawText(`Date: ${new Date().toLocaleDateString()}`);
    yPosition -= 20;

    // Donor Details Section
    drawText("Donor Details", { size: 16, bold: true });
    drawText(`Name: ${name}`);
    drawText(`Phone: ${phone}`);
    drawText(`Amount: INR ${amount}`); // Replace ₹ with INR
    drawText(`Donation Type: ${type}`);
    drawText(`District: ${district || "N/A"}`);
    if (panchayat) drawText(`Panchayat: ${panchayat}`);
    yPosition -= 20;

    // Transaction Details Section
    drawText("Transaction Details", { size: 16, bold: true });
    drawText(`Payment ID: ${paymentId}`);
    drawText(`Order ID: ${orderId}`);

    // Footer
    yPosition = margin;
    drawText("Thank you for your generous contribution!", {
      x: width / 2 - 100,
      size: 12,
    });

    // Serialize the PDF
    const pdfBytes = await doc.save();
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set(
      "Content-Disposition",
      `attachment; filename="Donation_Receipt_${donationId}.pdf"`
    );

    return new NextResponse(pdfBytes, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error generating receipt:", error);
    return NextResponse.json(
      { error: "Failed to generate receipt", details: error.message },
      { status: 500 }
    );
  }
}