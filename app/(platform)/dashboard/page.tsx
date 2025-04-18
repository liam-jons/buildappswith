import React from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/profile" className="text-primary hover:underline">
              My Profile
            </Link>
          </li>
          <li>
            <Link href="/api/auth/signout" className="text-primary hover:underline">
              Sign Out
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
