"use client";

export default function AdminHeader() {
  const logout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    window.location.href = "/admin/login";
  };

  return (
    <header className="h-24 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 text-gray-900 dark:text-gray-100">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Admin Panel
        </p>
        <p className="text-base font-medium">
          Catalog Management
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-200">
            A
          </div>

          <div className="leading-tight">
            <p className="text-sm font-medium">
              Admin
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Super user
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="text-sm px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
