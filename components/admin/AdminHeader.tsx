"use client";

export default function AdminHeader() {
  const logout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    window.location.href = "/admin/login";
  };

  return (
    <header className="h-24 bg-white flex items-center justify-between px-8">
      <div>
        <p className="text-sm text-gray-500">Admin Panel</p>
        <p className="text-base font-medium text-gray-900">
          Catalog Management
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-100 border rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
            A
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-gray-800">
              Admin
            </p>
            <p className="text-xs text-gray-500">
              Super user
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="text-sm px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
