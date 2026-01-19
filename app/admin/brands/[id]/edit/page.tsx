"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditBrand() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const [brand, setBrand] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) =>
        setBrand(data.find((b: any) => b._id === id))
      );
  }, [id]);

  async function update() {
    await fetch(`/api/brands/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brand),
    });

    router.push("/admin/brands");
  }

  if (!brand) {
    return (
      <div className="text-gray-600 dark:text-gray-400 p-6">
        Loading brand…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl text-gray-900 dark:text-gray-100">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Edit Brand</h1>

        <button
          onClick={update}
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg hover:opacity-90 transition"
        >
          Save Changes
        </button>
      </div>

      {/* FORM CARD */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm space-y-4">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Brand Name
          </label>
          <input
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2 w-full mt-1"
            value={brand.name}
            onChange={(e) =>
              setBrand({ ...brand, name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Website
          </label>
          <input
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2 w-full mt-1"
            value={brand.website || ""}
            onChange={(e) =>
              setBrand({
                ...brand,
                website: e.target.value,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
