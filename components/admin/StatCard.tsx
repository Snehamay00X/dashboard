"use client";

import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  icon,
  subtitle,
  loading = false,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <div className="mt-2">
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              <h3 className="text-3xl font-semibold text-gray-900">
                {value}
              </h3>
            )}
          </div>

          {subtitle && (
            <p className="mt-1 text-xs text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div className="p-3 rounded-lg bg-gray-100 text-gray-700">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
