'use client';

import { AdminDashboard } from '@/components/admin';
import { NavigationHeader } from '@/components/ui';

export default function AdminPage() {
  return (
    <>
      <NavigationHeader currentPage="admin" />
      <div className="pt-14">
        <AdminDashboard />
      </div>
    </>
  );
}
