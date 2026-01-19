"use client";

import { useEffect, useState } from "react";
import { AttributeDefinition } from "@/types/attribute";

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<AttributeDefinition[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [form, setForm] = useState<AttributeDefinition>({
    key: "",
    label: "",
    type: "text",
    allowedValues: [],
    isFilterable: true,
  });

  useEffect(() => {
    fetchAttributes();
  }, []);

  async function fetchAttributes() {
    const res = await fetch("/api/attributes");
    const data = await res.json();
    setAttributes(data);
  }

  async function createAttribute() {
    if (!form.key || !form.label) {
      alert("Key & Label required");
      return;
    }

    await fetch("/api/attributes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        key: form.key.toLowerCase().trim(),
      }),
    });

    setForm({
      key: "",
      label: "",
      type: "text",
      allowedValues: [],
      isFilterable: true,
    });

    fetchAttributes();
  }

  async function deleteAttribute(id: string) {
    if (!confirm("Delete this attribute permanently?")) return;

    setLoadingId(id);
    await fetch(`/api/attributes/${id}`, { method: "DELETE" });
    await fetchAttributes();
    setLoadingId(null);
  }

  return (
    <div className="space-y-6 max-w-6xl text-gray-900 dark:text-gray-100">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Attribute Manager</h1>

        <button
          onClick={createAttribute}
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg hover:opacity-90 transition"
        >
          Add Attribute
        </button>
      </div>

      {/* CREATE FORM */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Key
            </label>
            <input
              placeholder="thickness"
              value={form.key}
              onChange={(e) =>
                setForm({ ...form, key: e.target.value })
              }
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2 w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Label
            </label>
            <input
              placeholder="Thickness"
              value={form.label}
              onChange={(e) =>
                setForm({ ...form, label: e.target.value })
              }
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2 w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as any,
                })
              }
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2 w-full mt-1"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="select">Select</option>
            </select>
          </div>

          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.isFilterable}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isFilterable: e.target.checked,
                  })
                }
              />
              Filterable
            </label>
          </div>
        </div>

        {form.type === "select" && (
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Allowed Values
            </label>
            <textarea
              placeholder="e.g. 6mm, 12mm, 18mm"
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2 w-full mt-1"
              onChange={(e) =>
                setForm({
                  ...form,
                  allowedValues: e.target.value
                    .split(",")
                    .map((v) => v.trim().toLowerCase()),
                })
              }
            />
          </div>
        )}
      </div>

      {/* ATTRIBUTE TABLE */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Key</th>
              <th className="px-4 py-3 text-left">Label</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Filterable</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {attributes.map((attr) => (
              <tr
                key={attr._id}
                className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td className="px-4 py-3 font-mono text-sm">
                  {attr.key}
                </td>
                <td className="px-4 py-3">{attr.label}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {attr.type}
                </td>
                <td className="px-4 py-3">
                  {attr.isFilterable ? "Yes" : "No"}
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => deleteAttribute(attr._id!)}
                    disabled={loadingId === attr._id}
                    className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-40"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {attributes.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No attributes created yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
