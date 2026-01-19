"use client";

export default function ProductRow({
  product,
  onToggle,
  loading,
}: {
  product: any;
  onToggle: (id: string, isActive: boolean) => void;
  loading: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-4 transition ${
        product.isActive
          ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
      }`}
    >
      <div className="min-w-0">
        <p className="font-medium truncate">
          {product.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {product.brand?.name || "No brand"}
        </p>
      </div>

      <button
        disabled={loading}
        onClick={() => onToggle(product._id, !product.isActive)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          product.isActive
            ? "bg-green-500"
            : "bg-gray-300 dark:bg-gray-600"
        } ${loading ? "opacity-60" : ""}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full shadow transition ${
            product.isActive
              ? "translate-x-5 bg-white dark:bg-gray-100"
              : "translate-x-1 bg-white dark:bg-gray-100"
          }`}
        />
      </button>
    </div>
  );
}
