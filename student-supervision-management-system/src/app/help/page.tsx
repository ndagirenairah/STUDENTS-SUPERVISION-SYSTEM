import { Shield, CheckCircle, Brain, Camera, MapPin, Target, Activity, FileText, Users, Award } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">System Documentation</h1>
              <p className="text-sm text-slate-600">Remote & Office Student Supervision System</p>
            </div>
          </div>
          <Link href="/" className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
            ← Back to Login
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to the Supervision System</h2>
          <p className="text-slate-600 text-lg">
            A comprehensive platform for monitoring, supervising, and evaluating students working 
            either remotely or from office locations. The system ensures accountability through 
            5-layer verification and AI-powered fraud detection.
          </p>
        </div>

        {/* 5-Layer Verification */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">🛡️ 5-Layer Verification System</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Camera, title: 'Layer 1: Identity', desc: 'Live selfie capture to verify real identity', color: 'blue' },
              { icon: MapPin, title: 'Layer 2: Location', desc: 'GPS, IP address, and QR code verification', color: 'green' },
              { icon: Activity, title: 'Layer 3: Activity', desc: 'Real-time keyboard, mouse, and app monitoring', color: 'purple' },
              { icon: FileText, title: 'Layer 4: Evidence', desc: 'Work proof via GitHub, screenshots, documents', color: 'orange' },
              { icon: Users, title: 'Layer 5: Validation', desc: 'Supervisor random checks and reviews', color: 'red' },
            ].map((layer, idx) => {
              const Icon = layer.icon;
              return (
                <div key={idx} className={`border-2 border-${layer.color}-200 bg-${layer.color}-50 rounded-xl p-5`}>
                  <Icon className={`w-8 h-8 text-${layer.color}-600 mb-3`} />
                  <h3 className="font-semibold mb-2">{layer.title}</h3>
                  <p className="text-sm text-slate-600">{layer.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Features */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            AI-Powered Fraud Detection
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">What AI Does</h3>
              <ul className="space-y-2 text-slate-600">
                <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> Analyzes 10 behavioral features per student</li>
                <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> Predicts risk level with confidence score</li>
                <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> Detects suspicious patterns automatically</li>
                <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> Provides actionable recommendations</li>
                <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> Classifies screenshots by activity type</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Risk Classifications</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div>
                    <p className="font-medium text-green-900">Productive (Score &lt; 25)</p>
                    <p className="text-xs text-green-700">Excellent performance, low risk</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div>
                    <p className="font-medium text-blue-900">Average (Score 25-50)</p>
                    <p className="text-xs text-blue-700">Acceptable, minor improvements needed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div>
                    <p className="font-medium text-yellow-900">Suspicious (Score 50-75)</p>
                    <p className="text-xs text-yellow-700">Review recommended</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div>
                    <p className="font-medium text-red-900">High Risk (Score &gt; 75)</p>
                    <p className="text-xs text-red-700">Immediate action required</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Guides */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border-t-4 border-blue-500">
            <Award className="w-10 h-10 text-blue-600 mb-3" />
            <h3 className="font-bold text-lg mb-3">Student Guide</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>✓ Check in daily with selfie + GPS</li>
              <li>✓ Select Remote or Office mode</li>
              <li>✓ Complete assigned tasks</li>
              <li>✓ Submit work evidence</li>
              <li>✓ Respond to random checks (10 min)</li>
              <li>✓ Check out with daily summary</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border-t-4 border-purple-500">
            <Target className="w-10 h-10 text-purple-600 mb-3" />
            <h3 className="font-bold text-lg mb-3">Supervisor Guide</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>✓ Monitor assigned students</li>
              <li>✓ Assign tasks with deadlines</li>
              <li>✓ Review submitted evidence</li>
              <li>✓ Approve or reject work</li>
              <li>✓ Initiate random checks</li>
              <li>✓ Review AI risk scores</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border-t-4 border-red-500">
            <Shield className="w-10 h-10 text-red-600 mb-3" />
            <h3 className="font-bold text-lg mb-3">Admin Guide</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>✓ Manage users and departments</li>
              <li>✓ Assign supervisors to students</li>
              <li>✓ Generate reports (daily/weekly/monthly)</li>
              <li>✓ View AI analytics</li>
              <li>✓ Monitor system health</li>
              <li>✓ Configure settings</li>
            </ul>
          </div>
        </div>

        {/* Attendance Rules */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">⏰ Attendance Rules</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="font-semibold text-green-900 mb-1">Present</p>
              <p className="text-sm text-green-700">Check-in before 8:30 AM</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="font-semibold text-yellow-900 mb-1">Late</p>
              <p className="text-sm text-yellow-700">Check-in after 8:30 AM</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="font-semibold text-red-900 mb-1">Absent</p>
              <p className="text-sm text-red-700">No check-in recorded</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-4">
            <strong>Working Days:</strong> Monday to Friday
            <br />
            <strong>Working Hours:</strong> 8:00 AM – 5:00 PM
          </p>
        </div>

        {/* Productivity Score */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">📊 Productivity Score Formula</h2>
          <div className="bg-slate-50 rounded-lg p-6 font-mono text-center mb-4">
            <p className="text-lg">
              Score = (Attendance × 20%) + (Activity × 25%) + (Task Completion × 25%) 
              + (Evidence × 20%) + (Supervisor Rating × 10%)
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">80-100</p>
              <p className="text-xs text-green-600">Excellent</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">60-79</p>
              <p className="text-xs text-blue-600">Good</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-700">40-59</p>
              <p className="text-xs text-yellow-600">Average</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-700">&lt; 40</p>
              <p className="text-xs text-red-600">Poor</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-sm p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to Get Started?</h2>
          <p className="mb-6 text-blue-100">Log in with your credentials to access your dashboard</p>
          <Link 
            href="/" 
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50"
          >
            Go to Login
          </Link>
        </div>
      </main>

      <footer className="text-center py-8 text-sm text-slate-500">
        © 2026 Student Supervision System • AI-Powered • Secure • Reliable
      </footer>
    </div>
  );
}
