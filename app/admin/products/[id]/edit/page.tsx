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

  /* ---------------- IMAGES ---------------- */
  function handleImageUpload(files: FileList | null) {
    if (!files) return;
    setNewImages((prev) => [...prev, ...Array.from(files)]);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    handleImageUpload(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
  }

  function removeNewImage(i: number) {
    setNewImages((prev) => prev.filter((_, index) => index !== i));
  }

  function removeExistingImage(i: number) {
    setExistingImages((prev) => prev.filter((_, index) => index !== i));
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
  try {
    // 1. Upload newly added images
    let uploaded: string[] = [];

    if (newImages.length > 0) {
      uploaded = await uploadToCloudinary(newImages);
    }

    // 2. Merge old + new images
    const finalImages = [...existingImages, ...uploaded];

    // 3. Save product
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...product,
        images: finalImages,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.message || "Update failed");
      return;
    }

    router.push("/admin/products");
  } catch (err: any) {
    alert(err.message || "Upload failed");
  }
}


  if (loading) return <div className="p-6">Loading…</div>;


  /* ================= UI ================= */

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Edit Product</h1>
        <button
          onClick={updateProduct}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
        >
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* BASIC INFO */}
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <input
                className="border rounded-lg p-2 w-full mt-1"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Brand</label>
              <select
                className="border rounded-lg p-2 w-full mt-1"
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

            <div>
              <label className="text-sm text-gray-600">Description</label>
              <textarea
                className="border rounded-lg p-2 w-full mt-1"
                value={product.description || ""}
                onChange={(e) =>
                  setProduct({ ...product, description: e.target.value })
                }
              />
            </div>
          </div>

          {/* ATTRIBUTES */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-medium mb-4">Attributes</h2>

  {/* ADD ATTRIBUTE */}
  <div ref={dropdownRef} className="relative mb-6 z-40">
    <div
      onClick={() => setAttrDropdownOpen((v) => !v)}
      className="border border-gray-300 rounded-lg px-4 py-2 cursor-pointer bg-white flex items-center justify-between hover:border-gray-400"
    >
      <span className="text-gray-600">Add attribute</span>
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
                setProduct({
                  ...product,
                  attributes: {
                    ...product.attributes,
                    [attr.key]: "",
                  },
                });
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
              value={product.attributes[key] || ""}
              onChange={(e) =>
                setProduct({
                  ...product,
                  attributes: {
                    ...product.attributes,
                    [key]: e.target.value,
                  },
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
              value={product.attributes[key] || ""}
              onChange={(e) =>
                setProduct({
                  ...product,
                  attributes: {
                    ...product.attributes,
                    [key]: e.target.value,
                  },
                })
              }
            />
          )}

          {/* REMOVE ATTRIBUTE */}
          <button
            onClick={() => {
              const updatedAttrs = selectedAttrs.filter((k) => k !== key);
              const updatedValues = { ...product.attributes };
              delete updatedValues[key];

              setSelectedAttrs(updatedAttrs);
              setProduct({
                ...product,
                attributes: updatedValues,
              });
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
        <div className="bg-white p-6 rounded-xl shadow-sm sticky top-6 space-y-4">
          <h2 className="font-medium text-lg">Product Images</h2>

          {/* UPLOAD ZONE */}
          <label
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-400 transition bg-gray-50"
          >
            <input
              hidden
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
            />

            <div className="text-gray-500 space-y-1">
              <p className="text-sm font-medium">Click or drag images here</p>
              <p className="text-xs text-gray-400">
                PNG, JPG, WEBP up to 10MB
              </p>
            </div>
          </label>

          {/* IMAGE GRID */}
        <div className="grid grid-cols-3 gap-3">
          {[
            ...existingImages.map((url) => ({
              type: "old" as const,
              url,
            })),
            ...newImages.map((file) => ({
              type: "new" as const,
              file,
            })),
          ].map((img, i) => (
            <div
              key={i}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("index", i.toString())}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const from = Number(e.dataTransfer.getData("index"));
                moveImage(from, i);
              }}
              className="relative group rounded-lg overflow-hidden border bg-gray-100 cursor-move"
            >
              <img
                src={
                  img.type === "old"
                    ? img.url
                    : URL.createObjectURL(img.file)
                }
                className="w-full h-28 object-cover"
              />

              {/* PRIMARY */}
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-black text-white text-xs px-2 py-0.5 rounded">
                  Primary
                </span>
              )}

              {/* REMOVE */}
              <button
                onClick={() => {
                  if (img.type === "old") {
                    setExistingImages(existingImages.filter((_, x) => x !== i));
                  } else {
                    setNewImages(
                      newImages.filter((_, x) => x !== (i - existingImages.length))
                    );
                  }
                }}
                className="absolute top-1 right-1 bg-black/70 text-white text-xs w-6 h-6 rounded-full opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}

          {existingImages.length === 0 && newImages.length === 0 && (
            <div className="col-span-3 text-center text-gray-400 text-sm py-6">
              No images uploaded yet
            </div>
          )}
        </div>


        </div>

      </div>
    </div>
  );
}
