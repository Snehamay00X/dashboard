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
      className={`flex items-center justify-between p-4 border rounded-xl transition ${
        !product.isActive ? "opacity-40 bg-gray-50" : "bg-white"
      }`}
    >
      <div>
        <p className="font-medium">{product.name}</p>
        <p className="text-sm text-gray-500">
          {product.brand?.name || "No brand"}
        </p>
      </div>

      <button
        disabled={loading}
        onClick={() => onToggle(product._id, !product.isActive)}
        className={`relative w-12 h-6 rounded-full transition ${
          product.isActive ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 bg-white rounded-full transition ${
            product.isActive ? "right-0.5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
