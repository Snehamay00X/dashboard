"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/admin/StatCard";
import ProductRow from "@/components/admin/ProductRow";
import RecentProducts from "@/components/admin/RecentProducts";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showActive, setShowActive] = useState<"all" | "active" | "disabled">("all");
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [imageFilter, setImageFilter] = useState<"all" | "with" | "without">("all");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  async function loadProducts() {
    const params = new URLSearchParams({
      limit: "12",
      search,
      show: showActive,
    });

    if (showActive !== "all") {
      params.append("isActive", showActive === "active" ? "true" : "false");
    }
    if (imageFilter === "with") params.append("hasImages", "true");
    if (imageFilter === "without") params.append("hasImages", "false");

    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products);
  }

  useEffect(() => {
    loadProducts();
  }, [search, showActive, imageFilter]);

  async function toggleStatus(id: string, isActive: boolean) {
    setToggleLoading(id);

    await fetch(`/api/products/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });

    await loadProducts();
    setToggleLoading(null);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-semibold">
        Dashboard
      </h1>

      {/* KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Products" value={stats?.products.total} loading={loading} icon={<span>📦</span>} />
        <StatCard title="Active Products" value={stats?.products.active} subtitle={`${stats?.products.total - stats?.products.active || 0} disabled`} loading={loading} icon={<span>✅</span>} />
        <StatCard title="Brands" value={stats?.brands.total} subtitle={`${stats?.brands.active || 0} active`} loading={loading} icon={<span>🏷️</span>} />
        <StatCard title="Attributes" value={stats?.attributes.total} loading={loading} icon={<span>🧩</span>} />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-lg font-semibold">
              Product Control
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                placeholder="Search name or attributes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 w-full sm:w-80 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <select
                value={showActive}
                onChange={(e) => setShowActive(e.target.value as any)}
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>

              <select
                value={imageFilter}
                onChange={(e) => setImageFilter(e.target.value as any)}
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2"
              >
                <option value="all">All Images</option>
                <option value="with">With Images</option>
                <option value="without">No Images</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800">
            {products.map((p) => (
              <ProductRow
                key={p._id}
                product={p}
                loading={toggleLoading === p._id}
                onToggle={toggleStatus}
              />
            ))}

            {products.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">
                No products match your filter
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">
              Catalog Health
            </h3>

            <div className="space-y-4">
              <StatCard title="Products Without Images" value={stats?.products.noImages} subtitle="Needs attention" icon={<span>📷</span>} loading={loading} />
              <StatCard title="Disabled Products" value={stats?.products.total - stats?.products.active} subtitle="Hidden from site" icon={<span>🚫</span>} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
