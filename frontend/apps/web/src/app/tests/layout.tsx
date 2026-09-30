"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboardlayout";

export default function TestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/tests", label: "All Tests" },
    { href: "/tests/new", label: "Add Test" },
    { href: "/tests/categories", label: "Categories" },
    { href: "/tests/parameters", label: "Parameters" },
    { href: "/tests/reference-ranges", label: "Reference Ranges" },
    { href: "/tests/packages", label: "Packages" },
  ];

  return (
    <DashboardLayout title="Tests Management">
      <div className="space-y-6">
        {/* Navigation */}
        <nav className="border-b border-gray-200">
          <div className="flex space-x-8 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/tests" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Page Content */}
        {children}
      </div>
    </DashboardLayout>
  );
}
