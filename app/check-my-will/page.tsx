"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const Page = () => {
  const [hasSimpleWill, setHasSimpleWill] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Logic to check if the user has a simple will (for example, checking from a context, API, etc.)
    const userHasSimpleWill = true; // This would be dynamic based on user data.
    setHasSimpleWill(userHasSimpleWill);
  }, []);

  const handleRedirect = () => {
    router.push("/check-my-will/simple");
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-md border-white/20 rounded-xl p-6 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
              Check My Will
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasSimpleWill ? (
              <Button
                onClick={handleRedirect}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Check Your Simple Will
              </Button>
            ) : (
              <p className="text-gray-300 text-center">
                You do not have a Simple Will.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Page;
