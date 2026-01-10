"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      setError("Invalid credentials");
      return;
    }

    window.location.href = "/admin";
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center">
      {/* outer fills admin content area */}

      <div className="w-full max-w-lg bg-white border rounded-xl shadow-lg p-10">
        <h1 className="text-2xl font-semibold mb-8 text-center">
          Admin Login
        </h1>

        <input
          className="border px-4 py-3 w-full mb-4 rounded-md text-lg"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="border px-4 py-3 w-full mb-4 rounded-md text-lg"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">
            {error}
          </p>
        )}

        <button
          onClick={submit}
          className="w-full bg-black text-white py-3 rounded-md text-lg hover:bg-black/90 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
