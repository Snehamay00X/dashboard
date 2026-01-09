"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/admin/StatCard";
import RecentProducts from "@/components/admin/RecentProducts";


export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

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
          title="Attributes"
          value={stats?.attributes.total}
          loading={loading}
          icon={<span>🧩</span>}
        />
      </div>
      <RecentProducts />

    </div>
  );
}
