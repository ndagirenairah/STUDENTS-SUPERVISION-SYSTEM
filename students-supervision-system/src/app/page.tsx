"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/actions";
import { Shield, Users, TrendingUp, CheckCircle } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email.trim(), password);
      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.success) {
        router.refresh();
        if (result.role === "student") {
          router.push("/student");
        } else if (result.role === "supervisor") {
          router.push("/supervisor");
        } else {
          router.push("/admin");
        }
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-slate-900">
            Student Supervision System
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-600">
            Advanced remote and office student supervision with 5-layer
            verification
          </p>
        </div>

        <div className="mx-auto mb-16 grid max-w-6xl gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 text-center shadow-md">
            <Shield className="mx-auto mb-3 h-12 w-12 text-blue-600" />
            <h3 className="mb-2 text-lg font-semibold">Identity Verification</h3>
            <p className="text-sm text-slate-600">
              Face recognition & secure login
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 text-center shadow-md">
            <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-600" />
            <h3 className="mb-2 text-lg font-semibold">Location Tracking</h3>
            <p className="text-sm text-slate-600">GPS & IP verification</p>
          </div>
          <div className="rounded-xl bg-white p-6 text-center shadow-md">
            <TrendingUp className="mx-auto mb-3 h-12 w-12 text-purple-600" />
            <h3 className="mb-2 text-lg font-semibold">Activity Monitoring</h3>
            <p className="text-sm text-slate-600">
              Real-time productivity tracking
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 text-center shadow-md">
            <Users className="mx-auto mb-3 h-12 w-12 text-orange-600" />
            <h3 className="mb-2 text-lg font-semibold">Task Management</h3>
            <p className="text-sm text-slate-600">Assign, track & verify work</p>
          </div>
        </div>

        <div className="mx-auto max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-2 text-center text-2xl font-bold">Sign In</h2>
            <p className="mb-6 text-center text-sm text-slate-500">
              Use the account you created during registration
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 space-y-3 text-center">
              <div className="text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <a
                  href="/register"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Create one here
                </a>
              </div>
              <a
                href="/help"
                className="block text-sm text-slate-600 hover:underline"
              >
                System Documentation & Help
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
