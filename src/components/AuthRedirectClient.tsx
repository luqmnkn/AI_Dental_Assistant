"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthRedirectClient() {
  const router = useRouter();
  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        if (d?.user) router.replace('/dashboard');
      })
      .catch(() => {});
    return () => { mounted = false };
  }, [router]);

  return null;
}
