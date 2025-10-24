"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    area: "",
    street: "",
    building: "",
    flat: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Only allow delivery inside Al Ain
  const areasInAlAin = [
    "Al Jimi",
    "Al Mutarad",
    "Al Towayya",
    "Al Maqam",
    "Al Hili",
    "Al Muneera",
    "Al Ain Industrial Area",
    "Al Foah",
    "Al Markhaniya",
    "Zakhir",
    "Al Khabisi",
    "Al Bateen",
    "Falaj Hazzaa",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Basic validation
    if (
      !formData.fullName ||
      !formData.mobile ||
      !formData.area ||
      !formData.street ||
      !formData.building
    ) {
      setError("Please fill all required fields.");
      return;
    }

    // UAE mobile validation: starts with 05 and has 9 digits total
    const mobilePattern = /^05\d{7}$/;
    if (!mobilePattern.test(formData.mobile)) {
      setError("Enter a valid UAE mobile number (e.g., 0501234567).");
      return;
    }

    // Simulate checkout submission
    try {
      await new Promise((res) => setTimeout(res, 1000));
      setSuccess(true);
    } catch (err) {
      setError("Checkout failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mobile Number (UAE) <span className="text-red-500">*</span>
            </label>
            <input
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0501234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Area in Al Ain <span className="text-red-500">*</span>
            </label>
            <select
              name="area"
              value={formData.area}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Area</option>
              {areasInAlAin.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Street Name <span className="text-red-500">*</span>
            </label>
            <input
              name="street"
              value={formData.street}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter street name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Building / Villa <span className="text-red-500">*</span>
              </label>
              <input
                name="building"
                value={formData.building}
                onChange={handleChange}
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Building name or number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Flat / Unit (optional)
              </label>
              <input
                name="flat"
                value={formData.flat}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Flat or unit number"
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">Checkout successful!</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Confirm Checkout
          </button>
        </form>
      </div>
    </div>
  );
}
