'use client';

import { useState } from 'react';
import { createUser, assignSupervisor, generateReport } from '@/lib/actions';
import {
  Users, UserCheck, GraduationCap, AlertTriangle,
  TrendingUp, PlusCircle, Shield, Settings, Brain, FileText, Download,
  LayoutDashboard, UserCog
} from 'lucide-react';
import { TRAINING_DATASET, MODEL_METRICS } from '@/lib/ai-engine';
import { DashboardShell, EmptyState } from '@/components/dashboard-shell';

interface AdminData {
  user: any;
  stats: {
    totalUsers: number;
    totalStudents: number;
    totalSupervisors: number;
    presentToday: number;
    highRisk: number;
    avgProductivity: number;
  };
  users: any[];
  students: any[];
  supervisors: any[];
}

export default function AdminDashboardClient({ data, logoutAction }: { data: AdminData; logoutAction: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'ai'>('overview');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [reportData, setReportData] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    studentId: '',
  });

  const handleCreateUser = async () => {
    try {
      await createUser(newUser as any);
      setShowUserForm(false);
      setNewUser({ name: '', email: '', password: '', role: 'student', department: '', studentId: '' });
      window.location.reload();
    } catch (err) {
      alert('Failed to create user.');
    }
  };

  const handleAssignSupervisor = async () => {
    try {
      await assignSupervisor(selectedStudentId, selectedSupervisorId);
      setShowAssignForm(false);
      setSelectedStudentId('');
      setSelectedSupervisorId('');
      window.location.reload();
    } catch (err) {
      alert('Failed to assign supervisor.');
    }
  };

  const handleGenerateReport = async () => {
    try {
      const report = await generateReport(reportType);
      setReportData(report);
    } catch (err) {
      alert('Failed to generate report.');
    }
  };

  const handleDownloadReport = () => {
    if (!reportData) return;
    const content = JSON.stringify(reportData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.type}_report_${reportData.period.start}_to_${reportData.period.end}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <UserCog className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Analytics', icon: <Brain className="w-4 h-4" /> },
  ];

  return (
    <DashboardShell
      title="Admin Dashboard"
      subtitle={data.user.name}
      accent="indigo"
      navItems={navItems}
      activeId={activeTab}
      onNavigate={(id) => setActiveTab(id as typeof activeTab)}
      logoutAction={logoutAction}
    >
      <div className="mx-auto max-w-7xl">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-5">
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-2xl font-bold">{data.stats.totalUsers}</p>
                <p className="text-sm text-slate-600">Total Users</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <GraduationCap className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-2xl font-bold">{data.stats.totalStudents}</p>
                <p className="text-sm text-slate-600">Students</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <UserCheck className="w-8 h-8 text-purple-600 mb-2" />
                <p className="text-2xl font-bold">{data.stats.totalSupervisors}</p>
                <p className="text-sm text-slate-600">Supervisors</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <UserCheck className="w-8 h-8 text-orange-600 mb-2" />
                <p className="text-2xl font-bold">{data.stats.presentToday}</p>
                <p className="text-sm text-slate-600">Present Today</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <AlertTriangle className="w-8 h-8 text-yellow-600 mb-2" />
                <p className="text-2xl font-bold">{data.stats.highRisk}</p>
                <p className="text-sm text-slate-600">High Risk</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <TrendingUp className="w-8 h-8 text-indigo-600 mb-2" />
                <p className="text-2xl font-bold">{data.stats.avgProductivity}%</p>
                <p className="text-sm text-slate-600">Avg. Productivity</p>
              </div>
            </div>

            {/* System Health */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Attendance Rate</span>
                    <span className="font-bold">
                      {data.stats.totalStudents > 0 
                        ? Math.round((data.stats.presentToday / data.stats.totalStudents) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-600"
                      style={{ width: `${data.stats.totalStudents > 0 ? (data.stats.presentToday / data.stats.totalStudents) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Productivity Score</span>
                    <span className="font-bold">{data.stats.avgProductivity}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                      style={{ width: `${data.stats.avgProductivity}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowUserForm(true)}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" /> Add New User
                  </button>
                  <button className="w-full px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                    <Settings className="w-4 h-4" /> System Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAssignForm(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" /> Assign Supervisor
                </button>
                <button
                  onClick={() => setShowUserForm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> Add User
                </button>
              </div>
            </div>

            {/* Students with supervisor assignment */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
                <h3 className="font-semibold text-blue-900">Students ({data.students.length})</h3>
              </div>
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Student ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Supervisor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.students.map((student) => {
                    const supervisor = data.supervisors.find(s => s.id === student.supervisorId);
                    const supervisorUser = supervisor ? data.users.find(u => u.id === supervisor.userId) : null;
                    return (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{student.studentId}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{student.department}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {supervisorUser ? (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                              {supervisorUser.name}
                            </span>
                          ) : (
                            <span className="text-red-500 text-xs">Not assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedStudentId(student.id);
                              setShowAssignForm(true);
                            }}
                            className="text-purple-600 hover:underline text-sm"
                          >
                            {supervisorUser ? 'Change' : 'Assign'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* All Users */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">All Users ({data.users.length})</h3>
              </div>
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          user.role === 'admin' ? 'bg-red-100 text-red-700' :
                          user.role === 'supervisor' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{user.role}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Analytics Dashboard</h2>
                <p className="text-sm text-slate-600">Intelligent fraud detection and productivity prediction</p>
              </div>
            </div>

            {/* Model Metrics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">🤖 AI Model Performance</h3>
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <p className="text-xs text-slate-600 mb-1">Accuracy</p>
                  <p className="text-3xl font-bold text-green-700">{MODEL_METRICS.accuracy}%</p>
                  <p className="text-xs text-slate-500 mt-1">Correct predictions</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <p className="text-xs text-slate-600 mb-1">Precision</p>
                  <p className="text-3xl font-bold text-blue-700">{MODEL_METRICS.precision}%</p>
                  <p className="text-xs text-slate-500 mt-1">True positive rate</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <p className="text-xs text-slate-600 mb-1">Recall</p>
                  <p className="text-3xl font-bold text-purple-700">{MODEL_METRICS.recall}%</p>
                  <p className="text-xs text-slate-500 mt-1">Sensitivity</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                  <p className="text-xs text-slate-600 mb-1">F1-Score</p>
                  <p className="text-3xl font-bold text-orange-700">{MODEL_METRICS.f1Score}%</p>
                  <p className="text-xs text-slate-500 mt-1">Harmonic mean</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-slate-600">Algorithm</p>
                  <p className="font-semibold">{MODEL_METRICS.algorithm}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-slate-600">Training Samples</p>
                  <p className="font-semibold">{MODEL_METRICS.trainingSamples.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-slate-600">Last Trained</p>
                  <p className="font-semibold">{MODEL_METRICS.trainingDate}</p>
                </div>
              </div>
            </div>

            {/* Training Dataset */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">📚 Training Dataset Sample</h3>
              <p className="text-sm text-slate-600 mb-4">
                The AI model was trained on historical student data to learn patterns of productive vs. fraudulent behavior.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-slate-700">Student</th>
                      <th className="px-4 py-2 text-left font-medium text-slate-700">Active Hours</th>
                      <th className="px-4 py-2 text-left font-medium text-slate-700">Idle Hours</th>
                      <th className="px-4 py-2 text-left font-medium text-slate-700">Evidence</th>
                      <th className="px-4 py-2 text-left font-medium text-slate-700">Task Completion</th>
                      <th className="px-4 py-2 text-left font-medium text-slate-700">Label</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {TRAINING_DATASET.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-medium">{row.student}</td>
                        <td className="px-4 py-2">{row.activeHours}h</td>
                        <td className="px-4 py-2">{row.idleHours}h</td>
                        <td className="px-4 py-2">{row.evidence}</td>
                        <td className="px-4 py-2">{row.taskCompletion}%</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                            row.label === 'productive' ? 'bg-green-100 text-green-700' :
                            row.label === 'average' ? 'bg-blue-100 text-blue-700' :
                            row.label === 'suspicious' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{row.label}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* How AI Works */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">🧠 How the AI Works</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold mb-1">1. Data Collection</h4>
                  <p className="text-sm text-slate-600">
                    System collects 10 features per student: check-in time, work mode, active hours, idle hours, 
                    tasks assigned/completed, evidence uploads, screenshots, supervisor rating, and response time.
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold mb-1">2. Feature Engineering</h4>
                  <p className="text-sm text-slate-600">
                    Raw data is transformed into numerical features. Example: Active hours normalized to 0-100 scale, 
                    task completion as percentage, idle time as risk factor.
                  </p>
                </div>
                <div className="border-l-4 border-indigo-500 pl-4">
                  <h4 className="font-semibold mb-1">3. Model Training</h4>
                  <p className="text-sm text-slate-600">
                    Random Forest classifier trained on 2,847 labeled samples. Model learns patterns like 
                    "high idle time + no evidence = suspicious behavior".
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold mb-1">4. Real-Time Prediction</h4>
                  <p className="text-sm text-slate-600">
                    For each student, AI analyzes current features and outputs: classification (Productive/Average/Suspicious/High Risk), 
                    confidence score (0-100%), risk factors, and actionable recommendations.
                  </p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold mb-1">5. Continuous Learning</h4>
                  <p className="text-sm text-slate-600">
                    Model retrains weekly with new data, improving accuracy over time. 
                    Supervisor feedback loops help correct misclassifications.
                  </p>
                </div>
              </div>
            </div>

            {/* AI vs Rule-Based */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">❌ Rule-Based (Traditional)</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-red-50 p-3 rounded">
                    <code className="text-xs">IF idle_hours &gt; 4 THEN suspicious</code>
                  </div>
                  <p className="text-slate-600">
                    <strong>Limitations:</strong>
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    <li>Fixed thresholds</li>
                    <li>No pattern learning</li>
                    <li>Manual rule updates</li>
                    <li>Misses complex patterns</li>
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">✅ AI-Based (Our System)</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-green-50 p-3 rounded">
                    <code className="text-xs">model.predict(features) → risk_score</code>
                  </div>
                  <p className="text-slate-600">
                    <strong>Advantages:</strong>
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    <li>Learns from data</li>
                    <li>Detects hidden patterns</li>
                    <li>Self-improving</li>
                    <li>Handles complex relationships</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Reports & Analytics</h2>
            
            {/* Report Generator */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Generate Report</h3>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="daily">Daily Report</option>
                    <option value="weekly">Weekly Report</option>
                    <option value="monthly">Monthly Report</option>
                  </select>
                </div>
                <button
                  onClick={handleGenerateReport}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Generate
                </button>
              </div>
            </div>

            {/* Report Results */}
            {reportData && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold capitalize">{reportData.type} Report</h3>
                    <p className="text-sm text-slate-600">
                      {reportData.period.start} to {reportData.period.end}
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadReport}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download JSON
                  </button>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <p className="text-xs text-slate-600 mb-1">Attendance Rate</p>
                    <p className="text-3xl font-bold text-green-700">{reportData.metrics.attendanceRate}%</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <p className="text-xs text-slate-600 mb-1">Avg Productivity</p>
                    <p className="text-3xl font-bold text-blue-700">{reportData.metrics.avgProductivity}%</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <p className="text-xs text-slate-600 mb-1">Present Days</p>
                    <p className="text-3xl font-bold text-purple-700">{reportData.metrics.presentDays}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                    <p className="text-xs text-slate-600 mb-1">Avg Active Hours</p>
                    <p className="text-3xl font-bold text-orange-700">{reportData.metrics.avgActiveHours}h</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-600">Total Days</p>
                    <p className="font-semibold text-lg">{reportData.metrics.totalDays}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-600">Late Days</p>
                    <p className="font-semibold text-lg text-yellow-600">{reportData.metrics.lateDays}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-600">Absent Days</p>
                    <p className="font-semibold text-lg text-red-600">{reportData.metrics.absentDays}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Department Overview</h3>
                <div className="space-y-4">
                  {['Software Engineering', 'UI/UX Design', 'Research & Development'].map((dept) => {
                    const deptStudents = data.students.filter(s => s.department === dept);
                    return (
                      <div key={dept}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{dept}</span>
                          <span className="text-slate-600">{deptStudents.length} students</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                            style={{ width: `${data.students.length > 0 ? (deptStudents.length / data.students.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Today's Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Check-ins</span>
                    <span className="font-bold text-lg">{data.stats.presentToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Absent</span>
                    <span className="font-bold text-lg text-red-600">
                      {data.stats.totalStudents - data.stats.presentToday}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">High Risk Students</span>
                    <span className="font-bold text-lg text-yellow-600">{data.stats.highRisk}</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Overall Attendance Rate</span>
                      <span className="font-bold text-lg text-green-600">
                        {data.stats.totalStudents > 0 
                          ? Math.round((data.stats.presentToday / data.stats.totalStudents) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Create User Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Create New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="student">Student</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              {(newUser.role === 'student' || newUser.role === 'supervisor') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <select
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="">Select department...</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Research & Development">Research & Development</option>
                  </select>
                </div>
              )}
              {newUser.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Student ID</label>
                  <input
                    type="text"
                    value={newUser.studentId}
                    onChange={(e) => setNewUser({ ...newUser, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="e.g., STU005"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowUserForm(false)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={!newUser.name || !newUser.email || !newUser.password}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Supervisor Modal */}
      {showAssignForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Assign Supervisor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Choose a student...</option>
                  {data.students.map(s => (
                    <option key={s.id} value={s.id}>{s.studentId} - {s.department}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Select Supervisor</label>
                <select
                  value={selectedSupervisorId}
                  onChange={(e) => setSelectedSupervisorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Choose a supervisor...</option>
                  {data.supervisors.map(s => {
                    const user = data.users.find(u => u.id === s.userId);
                    return (
                      <option key={s.id} value={s.id}>
                        {user?.name || 'Unknown'} - {s.department}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <UserCheck className="w-4 h-4 inline mr-1" />
                Assigned supervisor will see this student in their dashboard.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAssignForm(false);
                    setSelectedStudentId('');
                    setSelectedSupervisorId('');
                  }}
                  className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignSupervisor}
                  disabled={!selectedStudentId || !selectedSupervisorId}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardShell>
  );
}
