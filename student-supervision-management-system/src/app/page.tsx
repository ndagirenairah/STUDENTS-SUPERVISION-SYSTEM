'use client';

import { useState, useEffect } from 'react';
import { login } from '@/lib/actions';
import { Shield, Users, TrendingUp, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Seed database on first load
    fetch('/api/seed').catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Admin', email: 'admin@system.com', password: 'admin123' },
    { role: 'Supervisor', email: 'supervisor@system.com', password: 'supervisor123' },
    { role: 'Student', email: 'alice@student.com', password: 'student123' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Student Supervision System
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Advanced remote and office student supervision with 5-layer verification
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Identity Verification</h3>
            <p className="text-sm text-slate-600">Face recognition & secure login</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Location Tracking</h3>
            <p className="text-sm text-slate-600">GPS & IP verification</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Activity Monitoring</h3>
            <p className="text-sm text-slate-600">Real-time productivity tracking</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Users className="w-12 h-12 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Task Management</h3>
            <p className="text-sm text-slate-600">Assign, track & verify work</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-3 text-center">
                Demo Credentials
              </p>
              <div className="space-y-2">
                {demoCredentials.map((cred) => (
                  <button
                    key={cred.role}
                    onClick={() => {
                      setEmail(cred.email);
                      setPassword(cred.password);
                    }}
                    className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm transition-colors"
                  >
                    <span className="font-medium">{cred.role}:</span>{' '}
                    <span className="text-slate-600">{cred.email}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 text-center">
              <a href="/help" className="text-sm text-blue-600 hover:underline">
                📖 System Documentation & Help
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
