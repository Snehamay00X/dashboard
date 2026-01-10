import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="h-24 bg-white  flex items-center justify-between px-8">
          <div>
            <p className="text-sm text-gray-500">Admin Panel</p>
            <p className="text-base font-medium text-gray-900">
              Catalog Management
            </p>
          </div>

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
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
