"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { File, Folder } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "My Drive",
      href: "/dashboard",
      icon: <Folder className="w-5 h-5" />,
    },
    {
      name: "Shared with me",
      href: "/shared",
      icon: <File className="w-5 h-5" />,
    },
    { name: "Recent", href: "/recent", icon: <File className="w-5 h-5" /> },
    { name: "Starred", href: "/starred", icon: <File className="w-5 h-5" /> },
    { name: "Trash", href: "/trash", icon: <File className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-64px)] fixed">
      <div className="p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              pathname === item.href
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </div>

      <div className="px-4 py-6">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Storage
        </div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: "45%" }}
            ></div>
          </div>
          <div className="mt-1 text-xs text-gray-500">4.5 GB of 15 GB used</div>
        </div>
      </div>
    </div>
  );
}
