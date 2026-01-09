import Link from "next/link";

const nav = [
  { name: "Dashboard", href: "/admin" },
  { name: "Products", href: "/admin/products" },
  { name: "Brands", href: "/admin/brands" },
  { name: "Attributes", href: "/admin/attributes" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r p-4 hidden md:block">
        <h1 className="text-xl font-bold mb-8">Catalog Admin</h1>

        <nav className="space-y-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-6">
          <p className="font-medium">Admin Panel</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full" />
            <span className="text-sm text-gray-600">Admin</span>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
