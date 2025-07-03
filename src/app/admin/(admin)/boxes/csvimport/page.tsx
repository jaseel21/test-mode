"use client";
import React, { useState } from "react";
import Papa, { ParseResult } from "papaparse";
import { FileText, Upload } from "lucide-react";

interface Box {
  serialNumber: string;
  location: string;
  name: string;
  houseName: string;
  address: string;
  place: string;
  area: string;
  district: string;
  panchayath: string;
  ward: string;
  mahallu: string;
  pincode: string;
  mobileNumber: string;
  secondaryMobileNumber: string;
  careOf: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  agentRole: string;
}



const AddBoxesPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const requiredFields: (keyof Box)[] = [
    "serialNumber",
    "location",
    "name",
    "houseName",
    "address",
    "place",
    "area",
    "district",
    "panchayath",
    "ward",
    "mahallu",
    "pincode",
    "mobileNumber",
    "secondaryMobileNumber",
    "careOf",
    "agentId",
    "agentName",
    "agentPhone",
    "agentEmail",
    "agentRole",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv") {
        setMessage("❌ Please upload a valid CSV file.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!file) {
      setMessage("❌ Please select a CSV file to upload.");
      setLoading(false);
      return;
    }

    // Parse CSV file
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result: ParseResult<Partial<Box>>) => {
        try {
          const boxes: Box[] = result.data.map((row: Partial<Box>) => ({
            serialNumber: row.serialNumber?.trim() || "",
            location: row.location?.trim() || "",
            name: row.name?.trim() || "",
            houseName: row.houseName?.trim() || "",
            address: row.address?.trim() || "",
            place: row.place?.trim() || "",
            area: row.area?.trim() || "",
            district: row.district?.trim() || "",
            panchayath: row.panchayath?.trim() || "",
            ward: row.ward?.trim() || "",
            mahallu: row.mahallu?.trim() || "",
            pincode: row.pincode?.trim() || "",
            mobileNumber: row.mobileNumber?.trim() || "",
            secondaryMobileNumber: row.secondaryMobileNumber?.trim() || "",
            careOf: row.careOf?.trim() || "",
            agentId: row.agentId?.trim() || "",
            agentName: row.agentName?.trim() || "",
            agentPhone: row.agentPhone?.trim() || "",
            agentEmail: row.agentEmail?.trim() || "",
            agentRole: row.agentRole?.trim() || "",
          }));

          // Validate required fields
          const errors: string[] = [];
          boxes.forEach((box, index) => {
            requiredFields.forEach((field) => {
              if (!box[field]) {
                errors.push(
                  `Row ${index + 1}: ${field.replace(/([A-Z])/g, " $1").trim()} is required.`
                );
              }
            });
            // Validate mobileNumber and secondaryMobileNumber formats
            if (box.mobileNumber && !/^\d{10}$/.test(box.mobileNumber)) {
              errors.push(`Row ${index + 1}: mobileNumber must be a 10-digit number.`);
            }
            if (
              box.secondaryMobileNumber &&
              !/^\d{10}$/.test(box.secondaryMobileNumber)
            ) {
              errors.push(
                `Row ${index + 1}: secondaryMobileNumber must be a 10-digit number.`
              );
            }
            // Validate agentPhone format
            if (box.agentPhone && !/^\+?\d{10,12}$/.test(box.agentPhone)) {
              errors.push(
                `Row ${index + 1}: agentPhone must be a valid phone number (10-12 digits, optional + prefix).`
              );
            }
            // Validate agentEmail format
            if (
              box.agentEmail &&
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(box.agentEmail)
            ) {
              errors.push(`Row ${index + 1}: agentEmail must be a valid email address.`);
            }
            // Validate pincode format
            if (box.pincode && !/^\d{6}$/.test(box.pincode)) {
              errors.push(`Row ${index + 1}: pincode must be a 6-digit number.`);
            }
          });

          if (errors.length > 0) {
            setMessage(`❌ Validation errors:\n${errors.join("\n")}`);
            setLoading(false);
            return;
          }

          // Send each box to the API
          let successCount = 0;
          const errorMessages: string[] = [];

          for (const [index, box] of boxes.entries()) {
            try {
              const response = await fetch("/api/boxes/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
                },
                body: JSON.stringify(box),
              });

              const data = await response.json();

              if (!response.ok) {
                if (data.existed) {
                  errorMessages.push(
                    `Row ${index + 1}: Box with serialNumber ${box.serialNumber} already exists.`
                  );
                } else {
                  throw new Error(
                    data.error || `Failed to register box at row ${index + 1}`
                  );
                }
              } else {
                successCount++;
              }
            } catch (err: unknown) {
              errorMessages.push(
                `Row ${index + 1}: ${
                  err instanceof Error ? err.message : "Unknown error"
                }`
              );
            }
          }

          if (successCount === boxes.length) {
            setMessage(`✅ Successfully registered ${successCount} box(es).`);
            setFile(null);
            (document.getElementById("csvInput") as HTMLInputElement).value = "";
          } else {
            setMessage(
              `✅ Registered ${successCount} box(es).\n❌ Errors:\n${errorMessages.join(
                "\n"
              )}`
            );
          }
        } catch (err: unknown) {
          setMessage(
            `❌ ${
              err instanceof Error ? err.message : "An error occurred while processing the CSV."
            }`
          );
        } finally {
          setLoading(false);
        }
      },
      error: (err: unknown) => {
        setMessage(
          `❌ Failed to parse CSV file: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        setLoading(false);
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg my-8 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-6 px-8">
        <h2 className="text-2xl font-bold text-white">Bulk Register Donation Boxes</h2>
        <p className="text-blue-100 mt-1">
          Upload a CSV file to register multiple donation boxes at once
        </p>
      </div>

      {/* Message display */}
      {message && (
        <div className={`px-8 py-4 ${message.includes("✅") ? "bg-green-50" : "bg-red-50"}`}>
          <p
            className={`text-sm font-medium flex items-center ${
              message.includes("✅") ? "text-green-800" : "text-red-800"
            }`}
          >
            <span className="mr-2">{message.includes("✅") ? "✅" : "❌"}</span>
            <pre className="whitespace-pre-wrap">
              {message.replace(/^(✅|❌)\s/, "")}
            </pre>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8">
        <div className="mb-6">
          <label
            htmlFor="csvInput"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Upload CSV File <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="csvInput"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileText className="w-8 h-8 text-gray-400 mb-2" />
                <p className="mb-2 text-sm text-gray-500">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500">CSV files only</p>
              </div>
              <input
                id="csvInput"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !file}
            className={`px-6 py-2 rounded-lg font-medium text-white shadow-md flex items-center ${
              loading || !file
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload and Register Boxes
              </>
            )}
          </button>
        </div>
      </form>

      <div className="px-8 pb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          Expected CSV Format
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          The CSV file must include the following columns (all fields are required):
        </p>
        <pre className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 overflow-x-auto">
          {`serialNumber*,location*,name*,houseName*,address*,place*,area*,district*,panchayath*,ward*,mahallu*,pincode*,mobileNumber*,secondaryMobileNumber*,careOf*,agentId*,agentName*,agentPhone*,agentEmail*,agentRole*
AC-1001,City1,John Doe,House1,Address1,Place1,Area1,District1,Panch1,Ward1,Mahallu1,123456,9876543210,9876543211,Care1,agent123,Agent Name,+919876543210,agent@example.com,Volunteer`}
        </pre>
        <p className="text-xs text-gray-500 mt-2">
          Notes:
          <ul className="list-disc pl-4">
            <li>mobileNumber and secondaryMobileNumber must be a 10-digit number (e.g., 9876543210).</li>
            <li>pincode must be a 6-digit number (e.g., 123456).</li>
            <li>agentPhone must be a valid phone number (10-12 digits, optional + prefix, e.g., +919876543210).</li>
            <li>agentEmail must be a valid email address (e.g., user@example.com).</li>
            <li>All fields are required and must be provided in the CSV.</li>
          </ul>
        </p>
        <a
          href="data:text/csv;charset=utf-8,serialNumber,location,name,houseName,address,place,area,district,panchayath,ward,mahallu,pincode,mobileNumber,secondaryMobileNumber,careOf,agentId,agentName,agentPhone,agentEmail,agentRole\nAC-9999,SampleCity,Sample Name,SampleHouse,SampleAddress,SamplePlace,SampleArea,SampleDistrict,SamplePanch,SampleWard,SampleMahallu,123456,9876543210,9876543211,SampleCare,agent999,Sample Agent,+919876543210,agent@example.com,Volunteer"
          download="boxes_template.csv"
          className="inline-flex items-center px-6 py-2 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Download CSV Template
        </a>
      </div>
    </div>
  );
};

export default AddBoxesPage;