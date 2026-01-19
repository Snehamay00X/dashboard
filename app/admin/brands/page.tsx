"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Brand {
  _id: string;
  name: string;
  isActive: boolean;
  productCount: number;
}

export default function BrandList() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  async function fetchBrands() {
    const res = await fetch("/api/brands");
    const data = await res.json();
    setBrands(data);
  }

  async function toggleBrand(brand: Brand) {
    setLoadingId(brand._id);

    if (brand.isActive) {
      await fetch(`/api/brands/${brand._id}`, { method: "DELETE" });
    } else {
      await fetch(`/api/brands/${brand._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
    }

    await fetchBrands();
    setLoadingId(null);
  }

  return (
    <div className="space-y-6 max-w-6xl text-gray-900 dark:text-gray-100">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Brands</h1>

        <Link
          href="/admin/brands/create"
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          + Add Brand
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Brand</th>
              <th className="px-4 py-3 text-left">Usage</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center">Active</th>
              <th className="px-4 py-3 text-right">Edit</th>
            </tr>
          </thead>

          <tbody>
            {brands.map((b) => {
              const isLoading = loadingId === b._id;

              return (
                <tr
                  key={b._id}
                  className={`border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                    !b.isActive ? "opacity-60" : ""
                  }`}
                >
                  {/* BRAND */}
                  <td className="px-4 py-3 font-medium">
                    {b.name}
                  </td>

                  {/* USAGE */}
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {b.productCount === 0 ? (
                      <span className="text-gray-400 dark:text-gray-500">
                        Unused
                      </span>
                    ) : (
                      <span className="font-medium">
                        {b.productCount} product
                        {b.productCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-3 text-sm">
                    {b.isActive ? (
                      <span className="text-green-600 dark:text-green-400">
                        Active
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        Disabled
                      </span>
                    )}
                  </td>

                  {/* TOGGLE */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleBrand(b)}
                      disabled={isLoading}
                      className={`relative w-11 h-6 rounded-full transition ${
                        b.isActive
                          ? "bg-green-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      } ${isLoading ? "opacity-50" : ""}`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full transition bg-white dark:bg-gray-100 ${
                          b.isActive ? "right-0.5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </td>

                  {/* EDIT */}
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/brands/${b._id}/edit`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}

            {brands.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No brands found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
