"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ActivityOverview from "@/components/dashboard/ActivityOverview";
import MainActions from "@/components/dashboard/MainActions";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import Navbar from "@/components/Navbar";

function DashboardPage() {
  const router = useRouter();
  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { if (mounted && !d?.user) router.replace('/'); })
      .catch(() => { if (mounted) router.replace('/'); });
    return () => { mounted = false };
  }, [router]);

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <WelcomeSection />
        <MainActions />
        <ActivityOverview />
      </div>
    </>
  );
}
export default DashboardPage;
