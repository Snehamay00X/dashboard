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
  const [imageFilter, setImageFilter] = useState<"all" | "with" | "without">("all");///


  /* ---------------- LOAD STATS ---------------- */
  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  /* ---------------- LOAD PRODUCTS ---------------- */
  async function loadProducts() {
    const params = new URLSearchParams({
      limit: "12",
      search,
      show: showActive/////
    });

    if (showActive !== "all") {
      params.append("isActive", showActive === "active" ? "true" : "false");
    }
    if (imageFilter === "with") {
    params.append("hasImages", "true");
  }
  if (imageFilter === "without") {
    params.append("hasImages", "false");
  }

    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products);
  }

  useEffect(() => {
    loadProducts();
  }, [search, showActive,imageFilter]);

  /* ---------------- TOGGLE ACTIVE ---------------- */
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
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats?.products.total}
          loading={loading}
          icon={<span>📦</span>}
        />

        <StatCard
          title="Active Products"
          value={stats?.products.active}
          subtitle={`${stats?.products.total - stats?.products.active || 0} disabled`}
          loading={loading}
          icon={<span>✅</span>}
        />

        <StatCard
          title="Brands"
          value={stats?.brands.total}
          subtitle={`${stats?.brands.active || 0} active`}
          loading={loading}
          icon={<span>🏷️</span>}
        />
        <StatCard
        title="Products Without Images"
        value={stats?.products.noImages}
        subtitle="Needs image upload"
        loading={loading}
        icon={<span>📷</span>}
         />

        <StatCard
          title="Attributes"
          value={stats?.attributes.total}
          loading={loading}
          icon={<span>🧩</span>}
        />
      </div>

      {/* ===== PRODUCT CONTROL ===== */}
      <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="font-semibold text-lg">Product Control</h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* SEARCH */}
            <input
              placeholder="Search name or attributes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full sm:w-80 focus:ring-2 focus:ring-black outline-none"
            />

            {/* STATUS FILTER */}
            <select
              value={showActive}
              onChange={(e) => setShowActive(e.target.value as any)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All</option>
              <option value="active">Active only</option>
              <option value="disabled">Disabled only</option>
            </select>

            {/* IMAGE FILTER */}
            <select
              value={imageFilter}
              onChange={(e) => setImageFilter(e.target.value as any)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Images</option>
              <option value="with">With Images</option>
              <option value="without">Without Images</option>
            </select>
          </div>
        </div>

        {/* PRODUCT LIST */}
        <div className="divide-y">
          {products.map((p) => (
            <ProductRow
              key={p._id}
              product={p}
              loading={toggleLoading === p._id}
              onToggle={toggleStatus}
            />
          ))}

          {products.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-10">
              No products match your filter
            </div>
          )}
        </div>
      </div>
      <RecentProducts/>
    </div>
  );
}
