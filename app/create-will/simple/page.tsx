"use client";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import CreateSimpleWill from "@/components/CreateSimpleWill";

export default function CreateSimpleWillPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen">
        <div className="mx-auto px-4 py-8">
          <CreateSimpleWill />
        </div>
      </div>
    </DashboardLayout>
  );
}
