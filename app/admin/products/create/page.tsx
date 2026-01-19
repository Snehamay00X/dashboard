"use client";

import { useEffect, useRef, useState } from "react";

/* ================= TYPES ================= */

interface Attribute {
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

export default function CreateProduct() {
  const [attributesDef, setAttributesDef] = useState<Attribute[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [selectedAttrs, setSelectedAttrs] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<Record<string, string>>({});

  const [attrDropdownOpen, setAttrDropdownOpen] = useState(false);
  const [attrSearch, setAttrSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [images, setImages] = useState<File[]>([]);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    description: "",
  });

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => setBrands(data.filter((b: any) => b.isActive)));
  }, []);

  useEffect(() => {
    fetch("/api/attributes")
      .then((res) => res.json())
      .then(setAttributesDef);
  }, []);

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
    setImages((prev) => [...prev, ...Array.from(files)]);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function submit() {
    if (!form.name || !form.brand) {
      alert("Product name and brand are required");
      return;
    }

    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        attributes,
      }),
    });

    alert("Product created");
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    handleImageUpload(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900 dark:text-gray-100">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Create Product</h1>
        <button
          onClick={submit}
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg hover:opacity-90 transition"
        >
          Create
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          {/* PRODUCT INFO */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm space-y-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Product Name
              </label>
              <input
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2 w-full mt-1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Brand
              </label>
              <select
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2 w-full mt-1"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Description
              </label>
              <textarea
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2 w-full mt-1"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>

          {/* ATTRIBUTES */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
            <h2 className="font-medium mb-4">Attributes</h2>

            {/* ADD ATTRIBUTE */}
            <div ref={dropdownRef} className="relative mb-6">
              <div
                onClick={() => setAttrDropdownOpen((v) => !v)}
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 cursor-pointer flex justify-between"
              >
                <span className="text-gray-600 dark:text-gray-400">
                  Add attribute
                </span>
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
                          setAttrDropdownOpen(false);
                        }}
                      >
                        {attr.label}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* SELECTED ATTRIBUTES */}
            <div className="space-y-4">
              {selectedAttrs.map((key) => {
                const attr = attributesDef.find((a) => a.key === key);
                if (!attr) return null;

                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3"
                  >
                    <label className="w-44 text-sm text-gray-600 dark:text-gray-400">
                      {attr.label}
                    </label>

                    <input
                      className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2 flex-1"
                      value={attributes[key] || ""}
                      onChange={(e) =>
                        setAttributes({
                          ...attributes,
                          [key]: e.target.value,
                        })
                      }
                    />

                    <button
                      onClick={() => {
                        const updated = { ...attributes };
                        delete updated[key];
                        setAttributes(updated);
                        setSelectedAttrs(selectedAttrs.filter((k) => k !== key));
                      }}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — IMAGES */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm sticky top-6 space-y-4">
          <h2 className="font-medium mb-4">Product Images</h2>

          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-gray-50 dark:bg-gray-800"
          >
            <input hidden type="file" multiple onChange={(e) => handleImageUpload(e.target.files)} />
            <p className="text-gray-500 dark:text-gray-400">
              Drop images here or click to upload
            </p>
          </label>

          <div className="grid grid-cols-3 gap-3">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
              >
                <img
                  src={URL.createObjectURL(img)}
                  className="w-full h-28 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
