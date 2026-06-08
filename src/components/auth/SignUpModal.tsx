"use client"

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignUpModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Error");
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">Sign up</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create your account</DialogTitle>
          <DialogDescription>Sign up with your email and a password.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-3 mt-4">
          <Input placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          {error && <div className="text-sm text-red-600">{error}</div>}

          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
