import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req) {
  try {
    const { paymentId, name, amount, mobileNumber, date, serialNumber } = await req.json();

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSizeTitle = 20;
    const fontSizeText = 12;

    let yPosition = height - 50;

    page.drawText("Payment Receipt", {
      x: width / 2 - font.widthOfTextAtSize("Payment Receipt", fontSizeTitle) / 2,
      y: yPosition,
      size: fontSizeTitle,
      font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 40;

    const details = [
      `Serial Number: ${serialNumber}`,
      `Name: ${name}`,
      `Mobile Number: ${mobileNumber}`,
      `Amount: Rs.${amount}`, // Changed ₹ to Rs.
      `Payment ID: ${paymentId}`,
      `Date: ${date ? new Date(date).toLocaleDateString() : "N/A"}`,
      `Generated on: ${new Date().toLocaleDateString()}`,
    ];

    details.forEach((line) => {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: fontSizeText,
        font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Receipt_${serialNumber}_${paymentId || "NoPayment"}.pdf`,
      },
    });
  } catch (error) {
    console.error("Error generating receipt:", error);
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 });
  }
}