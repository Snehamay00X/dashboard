"use client";

import { useEffect, useState,useRef } from "react";

export default function RecentProducts() {
  const [items, setItems] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  async function load() {
    if (loading || !hasMore) return;
    setLoading(true);

    const url = cursor
      ? `/api/admin/recent-products?cursor=${cursor}`
      : "/api/admin/recent-products";

    const res = await fetch(url);
    const data = await res.json();

    setItems((prev) => [...prev, ...data.products]);
    setCursor(data.nextCursor);
    setHasMore(data.hasMore);
    setLoading(false);
  }

  const didInit = useRef(false);

    useEffect(() => {
      if (didInit.current) return;
      didInit.current = true;
      load();
    }, []);


  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Recently Added Products</h2>
      </div>

      <div className="divide-y">
        {items.map((p) => (
          <div key={p._id} className="py-3 flex items-center gap-4">
            <img
              src={p.images?.[0] || "/placeholder.png"}
              className="w-12 h-12 object-cover rounded-lg bg-gray-100"
            />

            <div className="flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500">
                {p.brand?.name || "No brand"}
              </p>
            </div>

            <div className="text-sm text-gray-400">
              {new Date(p.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={load}
            disabled={loading}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
