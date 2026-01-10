"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { name: "Dashboard", href: "/admin" },
  { name: "Products", href: "/admin/products" },
  { name: "Brands", href: "/admin/brands" },
  { name: "Attributes", href: "/admin/attributes" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white  hidden md:flex flex-col">
      {/* LOGO / BRAND */}
      <div className="px-6 py-6 ">
        <h1 className="text-lg font-semibold tracking-tight text-gray-900">
          Catalog Admin
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Product Management
        </p>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                active
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-gray-300" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="px-6 py-4">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Shree Shyam
        </p>
      </div>
    </aside>
  );
}
