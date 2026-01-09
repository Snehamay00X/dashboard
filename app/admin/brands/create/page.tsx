"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateBrand() {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const router = useRouter();

  async function submit() {
    await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, website }),
    });

    router.push("/admin/brands");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Add Brand</h1>

        <button
          onClick={submit}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
        >
          Save
        </button>
      </div>

      {/* FORM CARD */}
      <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <div>
          <label className="text-sm text-gray-600">
            Brand Name
          </label>
          <input
            className="border rounded-lg p-2 w-full mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter brand name"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Website (optional)
          </label>
          <input
            className="border rounded-lg p-2 w-full mt-1"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      </div>
    </div>
  );
}
