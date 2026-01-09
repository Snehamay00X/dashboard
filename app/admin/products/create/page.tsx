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

  async function uploadToCloudinary(files: File[]) {
  const uploaded: string[] = [];

  for (const file of files) {
    const sigRes = await fetch("/api/cloudinary/sign", {
      method: "POST",
    });

    const { signature, timestamp, apiKey, cloudName } = await sigRes.json();

    const form = new FormData();
    form.append("file", file);
    form.append("api_key", apiKey);
    form.append("timestamp", timestamp);
    form.append("signature", signature);
    form.append("folder", "products");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: form,
      }
    );

    const data = await res.json();

    if (!data.secure_url) {
      throw new Error("Cloudinary upload failed");
    }

    uploaded.push(data.secure_url);
  }

  return uploaded;
}


  const [form, setForm] = useState({
    name: "",
    brand: "",
    description: "",
  });

  /* ---------------- LOAD BRANDS ---------------- */
  useEffect(() => {
    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => setBrands(data.filter((b: any) => b.isActive)));
  }, []);

  /* ---------------- LOAD ATTRIBUTES ---------------- */
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

  const imageUrls = await uploadToCloudinary(images);

  await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...form,
      images: imageUrls,
      attributes,
    }),
  });

  alert("Product created");
}

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
                e.preventDefault();
                const files = e.dataTransfer.files;
                handleImageUpload(files);
              }

              function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
                e.preventDefault();
              }


      

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Create Product</h1>
        <button
          onClick={submit}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
        >
          Create
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE — FORM */}
        <div className="lg:col-span-2 space-y-6">
          {/* PRODUCT INFO */}
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <div>
              <label className="text-sm text-gray-600">Product Name</label>
              <input
                className="border rounded-lg p-2 w-full mt-1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Brand</label>
              <select
                className="border rounded-lg p-2 w-full mt-1"
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
              <label className="text-sm text-gray-600">Description</label>
              <textarea
                className="border rounded-lg p-2 w-full mt-1"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>

          {/* ATTRIBUTES */}
          {/* ATTRIBUTES */}
<div className="bg-white p-6 rounded-xl shadow-sm">
  <h2 className="font-medium mb-4">Attributes</h2>

  {/* ADD ATTRIBUTE */}
  <div ref={dropdownRef} className="relative mb-6 z-40">
    <div
      onClick={() => setAttrDropdownOpen((v) => !v)}
      className="border border-gray-300 rounded-lg px-4 py-2 cursor-pointer bg-white flex items-center justify-between hover:border-gray-400"
    >
      <span className="text-gray-600">
        Add attribute
      </span>
      <span className="text-gray-400 text-sm">⌄</span>
    </div>

    {attrDropdownOpen && (
      <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto z-50">
        <input
          placeholder="Search attributes..."
          className="px-4 py-3 w-full border-b bg-gray-50 outline-none text-sm sticky top-0"
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
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => {
                setSelectedAttrs([...selectedAttrs, attr.key]);
                setAttrSearch("");
                setAttrDropdownOpen(false);
              }}
            >
              {attr.label}
            </div>
          ))}

        {attributesDef.filter(
          (a) =>
            a.label.toLowerCase().includes(attrSearch.toLowerCase()) &&
            !selectedAttrs.includes(a.key)
        ).length === 0 && (
          <div className="px-4 py-6 text-sm text-gray-500 text-center">
            No attributes found
          </div>
        )}
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
          className="flex items-center gap-3 bg-gray-50 border rounded-lg px-4 py-3"
        >
          <label className="w-44 text-sm text-gray-600">
            {attr.label}
          </label>

          {attr.type === "select" ? (
            <select
              className="border rounded-lg p-2 flex-1 bg-white"
              value={attributes[key] || ""}
              onChange={(e) =>
                setAttributes({
                  ...attributes,
                  [key]: e.target.value,
                })
              }
            >
              <option value="">Select</option>
              {attr.allowedValues?.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={attr.type === "number" ? "number" : "text"}
              className="border rounded-lg p-2 flex-1 bg-white"
              value={attributes[key] || ""}
              onChange={(e) =>
                setAttributes({
                  ...attributes,
                  [key]: e.target.value,
                })
              }
            />
          )}

          {/* REMOVE ATTRIBUTE */}
          <button
            onClick={() => {
              const updatedAttrs = selectedAttrs.filter((k) => k !== key);
              const updatedValues = { ...attributes };
              delete updatedValues[key];

              setSelectedAttrs(updatedAttrs);
              setAttributes(updatedValues);
            }}
            className="text-red-500 hover:text-red-700 text-sm px-2"
          >
            Remove
          </button>
        </div>
      );
    })}
  </div>

  {selectedAttrs.length === 0 && (
    <div className="text-sm text-gray-400 mt-4">
      No attributes selected
    </div>
  )}
</div>


        </div>

        {/* RIGHT SIDE — IMAGES */}
        <div className="bg-white p-6 rounded-xl shadow-sm h-fit sticky top-6">
          <h2 className="font-medium mb-4">Product Images</h2>

          {/* DROP ZONE */}
          <label
           onDrop={handleDrop}
            onDragOver={handleDragOver}
           className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-400 transition">
            <input
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={(e) => handleImageUpload(e.target.files)}
            />

            <div className="text-gray-500 text-sm space-y-1">
              <p className="font-medium">Drop images here</p>
              <p>or click to browse</p>
            </div>
          </label>

          {/* IMAGE GRID */}
          {images.length > 0 && (
            <div className="mt-5 space-y-2">
              <p className="text-sm text-gray-500">
                Drag to reorder — first image is primary
              </p>

              <div className="grid grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData("index", i.toString())
                    }
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const from = Number(
                        e.dataTransfer.getData("index")
                      );
                      const to = i;

                      if (from === to) return;

                      const updated = [...images];
                      const moved = updated.splice(from, 1)[0];
                      updated.splice(to, 0, moved);
                      setImages(updated);
                    }}
                    className="relative group cursor-move"
                  >
                    {/* IMAGE */}
                    <img
                      src={URL.createObjectURL(img)}
                      className="w-full h-28 object-cover rounded-lg border"
                    />

                    {/* PRIMARY BADGE */}
                    {i === 0 && (
                      <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-0.5 rounded">
                        Primary
                      </span>
                    )}

                    {/* REMOVE */}
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 bg-black text-white text-xs w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
