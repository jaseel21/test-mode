import { useState, useEffect } from "react";
import Select from "react-select";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";

export function ContributionForm({
  campaign,
  form,
  formErrors,
  isLoading,
  onSubmit,
  onCancel,
  onFormChange,
  setCampaigns,
}) {
  const [locationOptions, setLocationOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const { startLoading, stopLoading } = useLoading();

  const router = useRouter();

  const unitOptions = [
    { value: "Quantity", label: "Quantity (units)" },
    { value: "Litre", label: "Litre" },
    { value: "Kg", label: "Kg" },
    { value: "mg", label: "mg" },
  ];

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/kerala_local.json");
        const data = await response.json();

        const options = [];
        data.districts.forEach((district) => {
          options.push({
            value: district.name,
            label: district.name,
            type: "district",
            district: district.name,
          });
          district.block_panchayats.forEach((block) => {
            block.grama_panchayats.forEach((panchayat) => {
              options.push({
                value: `${district.name}, ${panchayat.name}`,
                label: panchayat.name,
                type: "panchayat",
                district: district.name,
              });
            });
          });

          district.urban_local_bodies.forEach((urban) => {
            options.push({
              value: `${district.name}, ${urban.name}`,
              label: urban.name,
              type: "municipality",
              district: district.name,
            });
          });
        });

        setLocationOptions(options);
        setFilteredOptions(options);
        setIsLoadingLocations(false);
      } catch (error) {
        console.error("Error loading location data:", error);
        setIsLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      const filtered = locationOptions.filter(
        (option) => option.district === selectedDistrict && option.type !== "district"
      );
      setFilteredOptions(filtered);
    } else {
      const districts = locationOptions.filter((option) => option.type === "district");
      setFilteredOptions(districts);
    }
  }, [selectedDistrict, locationOptions]);

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    if (!district) onFormChange({ ...form, location: "" });
  };

  const handleCountChange = (delta) => {
    const newCount = Math.max(1, form.count + delta);
    onFormChange({
      ...form,
      count: newCount,
      amount: (campaign.rate || 0) * newCount,
    });
  };

  const districtOptions = locationOptions
    .filter((option) => option.type === "district")
    .map((district) => ({ value: district.district, label: district.district }));

  const formatOptionLabel = ({ label, type }) => (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      {type !== "district" && (
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          {type === "panchayat" ? "Grama Panchayat" : "Municipality"}
        </span>
      )}
    </div>
  );

  const customStyles = {
    control: (base) => ({
      ...base,
      padding: "0.25rem",
      borderRadius: "0.5rem",
      borderColor: formErrors.location ? "#FCA5A5" : "#d1d5db",
      backgroundColor: formErrors.location ? "#FEF2F2" : "white",
      "&:hover": { borderColor: "#6366f1" },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#6366f1" : state.isFocused ? "#e0e7ff" : "white",
      color: state.isSelected ? "white" : "#374151",
      padding: "8px 12px",
    }),
    menuList: (base) => ({ ...base, maxHeight: "200px" }),
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    startLoading();

    onSubmit(campaign.id, campaign.type);

    const [district, panchayat] = form.location.split(", ").map((part) => part.trim() || "");

    if (campaign.type === "fixedamount") {
      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) throw new Error("Failed to load payment gateway");

        const orderResponse = await fetch("/api/donations/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
          },
          body: JSON.stringify({
            amount: form.amount * 100,
            type: "Campaign",
            name: form.fullName,
            phone: form.phoneNumber,
            email: form.email,
            district: district,
            panchayat: panchayat,
            campaignId: campaign.id || null,
          }),
        });
        const orderData = await orderResponse.json();
        if (!orderResponse.ok) throw new Error(orderData.error || "Order creation failed");

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourKeyIDHere",
          amount: Math.round(form.amount * 100),
          currency: "INR",
          name: "AIC Amal App",
          description: `Donation for ${campaign.title}`,
          order_id: orderData.orderId,
          handler: async (response) => {
            // const paymentData = {
            //   amount: form.amount,
            //   name: form.fullName,
            //   phone: form.phoneNumber,
            //   type: "Campaign",
            //   district: district || "Other",
            //   panchayat: panchayat || "",
            //   email: form.email,
            //   campaignId: campaign.id,
            //   razorpayPaymentId: response.razorpay_payment_id,
            //   razorpayOrderId: response.razorpay_order_id,
            //   razorpaySignature: response.razorpay_signature,
            // };

            startLoading();
            // const saveResponse = await fetch("/api/donations/create", {
            //   method: "POST",
            //   headers: {
            //     "Content-Type": "application/json",
            //     'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
            //   },
            //   body: JSON.stringify(paymentData),
            // });
            // const saveData = await saveResponse.json();
            // if (!saveResponse.ok) throw new Error(saveData.error || "Failed to save donation");

            // const updateResponse = await fetch(`/api/campaigns/${campaign.id}/update-amount`, {
            //   method: "PATCH",
            //   headers: {
            //     "Content-Type": "application/json",
            //     'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
            //   },
            //   body: JSON.stringify({ amount: form.amount }),
            // });
            // const updateData = await updateResponse.json();
            // if (!updateResponse.ok) throw new Error(updateData.error || "Failed to update campaign amount");

            setCampaigns((prevCampaigns) =>
              prevCampaigns.map((c) =>
                c.id === campaign.id ? { ...c, raised: (c.raised || 0) + form.amount } : c
              )
            );

            stopLoading();

            router.push(
              `/campaigns/success?donationId=${saveData.id}&amount=${form.amount}&name=${encodeURIComponent(
                form.fullName
              )}&phone=${form.phoneNumber}&type=${campaign.type}&district=${district || "Other"}&panchayat=${
                panchayat || ""
              }&paymentId=${response.razorpay_payment_id}&orderId=${response.razorpay_order_id}`
            );
          },
          theme: { color: "#10B981" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error("Donation error:", err);
        alert(`Failed to process donation: ${err.message}`);
      }

      return;
    }

    if (campaign.type === "physical") {
      startLoading();
      if (!form.quantity || isNaN(form.quantity) || form.quantity <= 0 || !form.unit) {
        alert("Please enter a valid quantity and unit for your contribution");
        return;
      }

      try {
        const donationData = {
          name: form.fullName,
          phone: form.phoneNumber,
          type: "Campaign",
          category: campaign.type,
          district: district || "Other",
          panchayat: panchayat || "",
          quantity: form.quantity,
          campaignId: campaign.id,
        };

        const saveResponse = await fetch("/api/donations/create-physical", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
          },
          body: JSON.stringify(donationData),
        });
        const saveData = await saveResponse.json();
        if (!saveResponse.ok) throw new Error(saveData.error || "Failed to save donation");

        const updateResponse = await fetch(`/api/campaigns/${campaign.id}/update-amount`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
          },
          body: JSON.stringify({ amount: form.quantity }),
        });
        const updateData = await updateResponse.json();
        if (!updateResponse.ok) throw new Error(updateData.error || "Failed to update campaign");

        setCampaigns((prevCampaigns) =>
          prevCampaigns.map((c) =>
            c.id === campaign.id ? { ...c, raised: (c.raised || 0) + (form.quantity || 0) } : c
          )
        );
        stopLoading();

        alert("Thank you for your contribution!");
        onCancel();
        return;
      } catch (err) {
        console.error("Physical donation error:", err);
        alert(`Failed to process contribution: ${err.message}`);
      }
    }

    if (campaign.type === "fundraising") {
      startLoading();
      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) throw new Error("Failed to load payment gateway");

        const orderResponse = await fetch("/api/donations/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
          },
          body: JSON.stringify({
            amount: form.amount * 100,
            type: "Campaign",
            name: form.fullName,
            phone: form.phoneNumber,
            email: form.email,
            district: district,
            panchayat: panchayat,
            campaignId: campaign.id || null,
          }),
        });
        const orderData = await orderResponse.json();
        if (!orderResponse.ok) throw new Error(orderData.error || "Order creation failed");

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourKeyIDHere",
          amount: Math.round(form.amount * 100),
          currency: "INR",
          name: "AIC Amal App",
          description: `Donation for ${campaign.title}`,
          order_id: orderData.orderId,
          handler: async (response) => {
            // const paymentData = {
            //   amount: form.amount,
            //   name: form.fullName,
            //   phone: form.phoneNumber,
            //   type: "Campaign",
            //   district: district || "Other",
            //   panchayat: panchayat || "",
            //   email: form.email,
            //   campaignId: campaign.id,
            //   razorpayPaymentId: response.razorpay_payment_id,
            //   razorpayOrderId: response.razorpay_order_id,
            //   razorpaySignature: response.razorpay_signature,
            // };

            startLoading();
            // const saveResponse = await fetch("/api/donations/create", {
            //   method: "POST",
            //   headers: {
            //     "Content-Type": "application/json",
            //     'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
            //   },
            //   body: JSON.stringify(paymentData),
            // });
            // const saveData = await saveResponse.json();
            // if (!saveResponse.ok) throw new Error(saveData.error || "Failed to save donation");

            const updateResponse = await fetch(`/api/campaigns/${campaign.id}/update-amount`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
              },
              body: JSON.stringify({ amount: form.amount }),
            });
            const updateData = await updateResponse.json();
            if (!updateResponse.ok) throw new Error(updateData.error || "Failed to update campaign amount");

            setCampaigns((prevCampaigns) =>
              prevCampaigns.map((c) =>
                c.id === campaign.id ? { ...c, raised: (c.raised || 0) + form.amount } : c
              )
            );
            stopLoading();

            router.push(
              `/campaigns/success?donationId=${"noId"}&amount=${form.amount}&name=${encodeURIComponent(
                form.fullName
              )}&phone=${form.phoneNumber}&type=${"Campaign"}&district=${district || "Other"}&panchayat=${
                panchayat || ""
              }&paymentId=${response.razorpay_payment_id}&orderId=${response.razorpay_order_id}`
            );
          },
          theme: { color: "#10B981" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error("Donation error:", err);
        alert(`Failed to process donation: ${err.message}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <h4 className="font-medium text-gray-900 dark:text-gray-100">Support This Campaign</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`fullName-${campaign.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name*
          </label>
          <input
            id={`fullName-${campaign.id}`}
            type="text"
            placeholder="Your full name"
            className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 ${
              formErrors.fullName ? "border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-900" : "border-gray-300"
            }`}
            value={form.fullName}
            onChange={(e) => onFormChange({ ...form, fullName: e.target.value })}
          />
          {formErrors.fullName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.fullName}</p>}
        </div>
        <div>
          <label
            htmlFor={`phoneNumber-${campaign.id}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Phone Number* (10 digits required)
          </label>
          <input
            id={`phoneNumber-${campaign.id}`}
            type="tel"
            placeholder="Enter 10-digit phone number"
            className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 ${
              formErrors.phoneNumber ? "border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-900" : "border-gray-300"
            }`}
            value={form.phoneNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 10) {
                onFormChange({ ...form, phoneNumber: value });
              }
            }}
            required
            maxLength={10}
            pattern="[0-9]{10}"
            title="Please enter exactly 10 digits"
          />
          {formErrors.phoneNumber && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.phoneNumber}</p>
          )}
        </div>
      </div>
      <div>
        <label htmlFor={`email-${campaign.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email Address
        </label>
        <input
          id={`email-${campaign.id}`}
          type="email"
          placeholder="Your email address (optional)"
          className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 ${
            formErrors.email ? "border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-900" : "border-gray-300"
          }`}
          value={form.email}
          onChange={(e) => onFormChange({ ...form, email: e.target.value })}
        />
        {formErrors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.email}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location*</label>
        <div className="space-y-2">
          <Select
            options={districtOptions}
            onChange={(selected) => handleDistrictChange(selected?.value || null)}
            placeholder="Select your district first..."
            isClearable
            isSearchable
            styles={customStyles}
            className="w-full text-sm"
          />
          {selectedDistrict && (
            <Select
              options={filteredOptions}
              formatOptionLabel={formatOptionLabel}
              value={filteredOptions.find((option) => option.value === form.location) || null}
              onChange={(selected) => onFormChange({ ...form, location: selected?.value || "" })}
              placeholder={`Search in ${selectedDistrict}...`}
              isLoading={isLoadingLocations}
              styles={customStyles}
              isClearable
              className="w-full text-sm"
            />
          )}
          {formErrors.location && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.location}</p>}
        </div>
      </div>
      {campaign.type === "fundraising" ? (
        <div>
          <label htmlFor={`amount-${campaign.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Donation Amount (₹)*
          </label>
          <input
            id={`amount-${campaign.id}`}
            type="number"
            placeholder="Amount in ₹"
            className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 ${
              formErrors.amount ? "border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-900" : "border-gray-300"
            }`}
            value={form.amount || ""}
            onChange={(e) => onFormChange({ ...form, amount: Number(e.target.value) })}
            min="1"
          />
          {formErrors.amount && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.amount}</p>}
        </div>
      ) : campaign.type === "physical" ? (
        <div className="space-y-4">
          <div>
            <label htmlFor={`unit-${campaign.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unit Type*
            </label>
            <Select
              id={`unit-${campaign.id}`}
              options={unitOptions}
              value={unitOptions.find((option) => option.value === form.unit) || null}
              onChange={(selected) => onFormChange({ ...form, unit: selected?.value || "" })}
              placeholder="Select unit type..."
              styles={customStyles}
              className="w-full text-sm"
            />
            {formErrors.unit && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.unit}</p>}
          </div>
          <div>
            <label htmlFor={`quantity-${campaign.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity*
            </label>
            <div className="flex items-center">
              <input
                id={`quantity-${campaign.id}`}
                type="number"
                placeholder={`Enter quantity in ${form.unit || "units"}`}
                className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 ${
                  formErrors.quantity ? "border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-900" : "border-gray-300"
                }`}
                value={form.quantity || ""}
                onChange={(e) => onFormChange({ ...form, quantity: Number(e.target.value) })}
                min="1"
              />
              {form.unit && <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{form.unit}</span>}
            </div>
            {formErrors.quantity && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.quantity}</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Area:</span> {campaign.area || "Not specified"}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Rate:</span> ₹{(campaign.rate || 0).toLocaleString()}/unit
          </div>
          <div className="flex items-center space-x-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Count:</label>
            <div className="flex items-center border rounded-lg overflow-hidden dark:border-gray-600">
              <button
                type="button"
                onClick={() => handleCountChange(-1)}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                disabled={form.count <= 1 || isLoading}
              >
                -
              </button>
              <span className="px-4 py-1 text-sm font-medium text-gray-900 dark:text-gray-100">{form.count}</span>
              <button
                type="button"
                onClick={() => handleCountChange(1)}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                disabled={isLoading}
              >
                +
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Total Amount:</span> ₹{((campaign.rate || 0) * form.count).toLocaleString()}
          </div>
          {formErrors.count && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.count}</p>}
        </div>
      )}
      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 text-sm rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-all border border-gray-300 dark:border-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 py-2 text-sm rounded-lg text-white shadow-sm hover:shadow-md transition-all ${
            campaign.type === "fundraising"
              ? "bg-gradient-to-r from-purple-700 to-purple-600 dark:from-purple-600 dark:to-purple-500"
              : campaign.type === "physical"
              ? "bg-gradient-to-r from-indigo-700 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500"
              : "bg-gradient-to-r from-green-700 to-green-600 dark:from-green-600 dark:to-green-500"
          } disabled:opacity-60`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : campaign.type === "fundraising" ? "Donate Now" : campaign.type === "physical" ? "Join Now" : "Support Now"}
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Your information is secure and will only be used for this campaign.
      </p>
    </form>
  );
}