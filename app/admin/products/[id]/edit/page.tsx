"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

/* ================= TYPES ================= */

interface AttributeDef {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  allowedValues?: string[];
}

interface Brand {
  _id: string;
  name: string;
}

/* ================= COMPONENT ================= */

export default function EditProduct() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [attributesDef, setAttributesDef] = useState<AttributeDef[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAttrs, setSelectedAttrs] = useState<string[]>([]);
  const [attrDropdownOpen, setAttrDropdownOpen] = useState(false);
  const [attrSearch, setAttrSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then((r) => r.json()),
      fetch("/api/attributes").then((r) => r.json()),
      fetch("/api/brands").then((r) => r.json()),
    ]).then(([productData, attrDefs, brands]) => {
      setProduct({
        ...productData,
        attributes: productData.attributes || {},
      });

      setSelectedAttrs(Object.keys(productData.attributes || {}));
      setExistingImages(productData.images || []);
      setAttributesDef(attrDefs);
      setBrands(brands.filter((b: any) => b.isActive));
      setLoading(false);
    });
  }, [id]);

  /* ---------------- CLICK OUTSIDE ---------------- */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAttrDropdownOpen(false);
      }
    }

    if (attrDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [attrDropdownOpen]);

  function handleImageUpload(files: FileList | null) {
    if (!files) return;
    setNewImages((prev) => [...prev, ...Array.from(files)]);
  }

  function moveImage(from: number, to: number) {
    const combined = [
      ...existingImages.map((url) => ({ type: "old" as const, value: url })),
      ...newImages.map((file) => ({ type: "new" as const, value: file })),
    ];

    const item = combined.splice(from, 1)[0];
    combined.splice(to, 0, item);

    setExistingImages(combined.filter(i => i.type === "old").map(i => i.value));
    setNewImages(combined.filter(i => i.type === "new").map(i => i.value));
  }

  async function updateProduct() {
    await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    router.push("/admin/products");
  }

  if (loading) return <div className="p-6 text-gray-600 dark:text-gray-400">Loading…</div>;

  /* ================= UI ================= */

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900 dark:text-gray-100">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Edit Product</h1>
        <button
          onClick={updateProduct}
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg hover:opacity-90 transition"
        >
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* BASIC INFO */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm space-y-4">
            {["name", "description"].map((field) => (
              <div key={field}>
                <label className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {field}
                </label>
                <input
                  className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2 w-full mt-1"
                  value={product[field] || ""}
                  onChange={(e) => setProduct({ ...product, [field]: e.target.value })}
                />
              </div>
            ))}

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Brand</label>
              <select
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2 w-full mt-1"
                value={product.brand}
                onChange={(e) => setProduct({ ...product, brand: e.target.value })}
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ATTRIBUTES */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
            <h2 className="font-medium mb-4">Attributes</h2>

            <div ref={dropdownRef} className="relative mb-6">
              <div
                onClick={() => setAttrDropdownOpen((v) => !v)}
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 cursor-pointer flex justify-between"
              >
                <span className="text-gray-600 dark:text-gray-400">Add attribute</span>
                <span className="text-gray-400 dark:text-gray-500">⌄</span>
              </div>

              {attrDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl max-h-80 overflow-y-auto z-50">
                  <input
                    placeholder="Search attributes..."
                    className="px-4 py-3 w-full border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none text-sm sticky top-0"
                    value={attrSearch}
                    onChange={(e) => setAttrSearch(e.target.value)}
                  />

                  {attributesDef
                    .filter(
                      (a) =>
                        a.label.toLowerCase().includes(attrSearch.toLowerCase()) &&
                        !selectedAttrs.includes(a.key)
                    )
                    .map((attr) => (
                      <div
                        key={attr.key}
                        className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm"
                        onClick={() => {
                          setSelectedAttrs([...selectedAttrs, attr.key]);
                          setProduct({
                            ...product,
                            attributes: { ...product.attributes, [attr.key]: "" },
                          });
                          setAttrDropdownOpen(false);
                        }}
                      >
                        {attr.label}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — IMAGES */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm sticky top-6 space-y-4">
          <h2 className="font-medium text-lg">Product Images</h2>

          <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-gray-50 dark:bg-gray-800">
            <input hidden type="file" multiple onChange={(e) => handleImageUpload(e.target.files)} />
            <p className="text-gray-500 dark:text-gray-400">Click or drag images here</p>
          </label>

          <div className="grid grid-cols-3 gap-3">
            {existingImages.map((url, i) => (
              <div
                key={i}
                className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
              >
                <img src={url} className="w-full h-28 object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
