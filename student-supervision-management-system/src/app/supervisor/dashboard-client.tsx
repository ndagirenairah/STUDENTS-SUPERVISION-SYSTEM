'use client';

import { useState } from 'react';
import { assignTask, reviewEvidence, initiateRandomCheck } from '@/lib/actions';
import {
  LogOut, Users, UserCheck, UserX, Home, Wifi, AlertTriangle,
  PlusCircle, CheckCircle, XCircle, MessageSquare, Eye, Clock, Brain
} from 'lucide-react';
import AIInsightsPanel from '@/components/ai-insights-panel';
import { predictRiskLevel } from '@/lib/ai-engine';

interface SupervisorData {
  user: any;
  supervisor: any;
  students: any[];
  todayAttendance: any[];
  tasks: any[];
  productivityData: any[];
  pendingEvidence: any[];
  stats: {
    totalStudents: number;
    presentStudents: number;
    remoteStudents: number;
    officeStudents: number;
    absentStudents: number;
    highRiskStudents: number;
  };
}

export default function SupervisorDashboardClient({ data, logoutAction }: { data: SupervisorData; logoutAction: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'tasks' | 'evidence' | 'ai'>('overview');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showCheckForm, setShowCheckForm] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskDeliverables, setTaskDeliverables] = useState('');
  const [checkType, setCheckType] = useState('progress_question');
  const [checkQuestion, setCheckQuestion] = useState('');
  const [reviewingEvidence, setReviewingEvidence] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');

  const handleAssignTask = async () => {
    try {
      await assignTask({
        studentId: selectedStudentId,
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority as any,
        deadline: new Date(taskDeadline),
        expectedDeliverables: taskDeliverables,
      });
      setShowTaskForm(false);
      setTaskTitle('');
      setTaskDescription('');
      setTaskDeliverables('');
      window.location.reload();
    } catch (err) {
      alert('Failed to assign task.');
    }
  };

  const handleRandomCheck = async () => {
    try {
      await initiateRandomCheck({
        studentId: selectedStudentId,
        checkType: checkType as any,
        question: checkQuestion,
      });
      setShowCheckForm(false);
      setCheckQuestion('');
      alert('Random check initiated! Student will be notified.');
    } catch (err) {
      alert('Failed to initiate check.');
    }
  };

  const handleReview = async () => {
    if (!reviewingEvidence) return;
    try {
      await reviewEvidence(reviewingEvidence.id, reviewStatus, feedback);
      setReviewingEvidence(null);
      setFeedback('');
      window.location.reload();
    } catch (err) {
      alert('Failed to submit review.');
    }
  };

  const getStudentName = (studentId: string) => {
    return data.students.find(s => s.id === studentId)?.studentId || studentId;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Supervisor Dashboard</h1>
              <p className="text-sm text-slate-600">{data.user.name}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </form>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {['overview', 'students', 'tasks', 'evidence', 'ai'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'ai' ? '🤖 AI Insights' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-6 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-5">
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-2xl font-bold">{data.stats.totalStudents}</p>
                <p className="text-sm text-slate-600">Total Students</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <UserCheck className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-2xl font-bold">{data.stats.presentStudents}</p>
                <p className="text-sm text-slate-600">Present Today</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <Wifi className="w-8 h-8 text-purple-600 mb-2" />
                <p className="text-2xl font-bold">{data.stats.remoteStudents}</p>
                <p className="text-sm text-slate-600">Remote</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <Home className="w-8 h-8 text-orange-600 mb-2" />
                <p className="text-2xl font-bold">{data.stats.officeStudents}</p>
                <p className="text-sm text-slate-600">Office</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <UserX className="w-8 h-8 text-red-600 mb-2" />
                <p className="text-2xl font-bold">{data.stats.absentStudents}</p>
                <p className="text-sm text-slate-600">Absent</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <AlertTriangle className="w-8 h-8 text-yellow-600 mb-2" />
                <p className="text-2xl font-bold">{data.stats.highRiskStudents}</p>
                <p className="text-sm text-slate-600">High Risk</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => setShowTaskForm(true)}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-sm p-6 text-left hover:from-blue-600 hover:to-blue-700"
              >
                <PlusCircle className="w-8 h-8 mb-3" />
                <h3 className="text-xl font-semibold mb-1">Assign New Task</h3>
                <p className="text-blue-100 text-sm">Create and assign tasks to students</p>
              </button>
              <button
                onClick={() => setShowCheckForm(true)}
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-sm p-6 text-left hover:from-purple-600 hover:to-purple-700"
              >
                <MessageSquare className="w-8 h-8 mb-3" />
                <h3 className="text-xl font-semibold mb-1">Random Check</h3>
                <p className="text-purple-100 text-sm">Initiate random supervisor check</p>
              </button>
            </div>

            {/* High Risk Students */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                High-Risk Students
              </h3>
              {data.productivityData.filter(p => p.riskLevel === 'high' || p.riskLevel === 'medium').length === 0 ? (
                <p className="text-slate-500 text-center py-4">No high-risk students today</p>
              ) : (
                <div className="space-y-3">
                  {data.productivityData.filter(p => p.riskLevel === 'high' || p.riskLevel === 'medium').map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium">{getStudentName(p.studentId)}</p>
                        <p className="text-sm text-slate-600">Score: {p.totalScore}%</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        p.riskLevel === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{p.riskLevel}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Supervised Students</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.students.map((student) => {
                const attendance = data.todayAttendance.find(a => a.studentId === student.id);
                const productivity = data.productivityData.find(p => p.studentId === student.id);
                return (
                  <div key={student.id} className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{student.studentId}</h3>
                        <p className="text-sm text-slate-600">{student.department}</p>
                      </div>
                      <span className={`w-3 h-3 rounded-full ${attendance ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    {attendance && (
                      <div className="text-sm space-y-1 mb-3">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Status:</span>
                          <span className={`font-medium capitalize ${
                            attendance.status === 'present' ? 'text-green-600' : 
                            attendance.status === 'late' ? 'text-yellow-600' : 'text-red-600'
                          }`}>{attendance.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Mode:</span>
                          <span className="font-medium capitalize">{attendance.workMode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Check-in:</span>
                          <span className="font-medium">
                            {new Date(attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )}
                    {productivity && (
                      <div className="border-t pt-3 mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Productivity</span>
                          <span className="font-bold text-lg">{productivity.totalScore}%</span>
                        </div>
                        <div className="mt-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              productivity.totalScore >= 80 ? 'bg-green-500' :
                              productivity.totalScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${productivity.totalScore}%` }}
                          />
                        </div>
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-1 rounded capitalize ${
                            productivity.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                            productivity.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{productivity.riskLevel} risk</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Assigned Tasks</h2>
              <button
                onClick={() => setShowTaskForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Assign Task
              </button>
            </div>
            {data.tasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center text-slate-500">
                No tasks assigned yet
              </div>
            ) : (
              <div className="space-y-3">
                {data.tasks.map((task) => (
                  <div key={task.id} className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{task.title}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>{task.priority}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                        <div className="flex gap-4 text-xs text-slate-500">
                          <span>Student: {getStudentName(task.studentId)}</span>
                          <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                          <span className={`font-medium capitalize ${
                            task.status === 'completed' ? 'text-green-600' :
                            task.status === 'in_progress' ? 'text-yellow-600' :
                            task.status === 'approved' ? 'text-blue-600' :
                            'text-slate-600'
                          }`}>{task.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Pending Evidence Review</h2>
            {data.pendingEvidence.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center text-slate-500">
                No evidence pending review
              </div>
            ) : (
              data.pendingEvidence.map((ev) => (
                <div key={ev.id} className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium capitalize">{ev.evidenceType.replace('_', ' ')}</span>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Pending</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{ev.description}</p>
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span>Student: {getStudentName(ev.studentId)}</span>
                        <span>Submitted: {new Date(ev.submittedAt).toLocaleDateString()}</span>
                      </div>
                      {ev.evidenceUrl && (
                        <a href={ev.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline text-sm mt-2 inline-block">
                          View Evidence →
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => setReviewingEvidence(ev)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI-Powered Student Analysis</h2>
                <p className="text-sm text-slate-600">Real-time predictions for each supervised student</p>
              </div>
            </div>

            <div className="space-y-6">
              {data.students.map((student) => {
                const attendance = data.todayAttendance.find(a => a.studentId === student.id);
                const productivity = data.productivityData.find(p => p.studentId === student.id);
                const studentTasks = data.tasks.filter(t => t.studentId === student.id);
                const completedTasks = studentTasks.filter(t => t.status === 'completed' || t.status === 'approved').length;
                
                const aiFeatures = {
                  checkInTime: attendance ? Math.max(0, Math.round((new Date(attendance.checkInTime).getTime() - new Date(new Date().setHours(8, 0, 0, 0)).getTime()) / 60000)) : 0,
                  workMode: (attendance?.workMode as 'remote' | 'office') || 'remote',
                  activeHours: productivity ? (productivity.activityScore || 0) / 100 * 8 : 0,
                  idleHours: productivity ? 8 - (productivity.activityScore || 0) / 100 * 8 : 8,
                  tasksAssigned: studentTasks.length,
                  tasksCompleted: completedTasks,
                  evidenceUploaded: productivity ? Math.round((productivity.evidenceScore || 0) / 33) : 0,
                  screenshotCount: productivity ? Math.round((productivity.activityScore || 0) / 5) : 0,
                  supervisorRating: productivity?.supervisorRating || 50,
                  responseTime: 5,
                };

                const prediction = predictRiskLevel(aiFeatures);

                return (
                  <div key={student.id} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{student.studentId}</h3>
                        <p className="text-sm text-slate-600">{student.department}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-600">Status</p>
                        <p className="font-semibold capitalize">
                          {attendance ? attendance.status : 'absent'}
                        </p>
                      </div>
                    </div>
                    <AIInsightsPanel features={aiFeatures} showDetails={false} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Task Assignment Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Assign New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select student...</option>
                  {data.students.map(s => (
                    <option key={s.id} value={s.id}>{s.studentId}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deadline</label>
                  <input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expected Deliverables</label>
                <textarea
                  value={taskDeliverables}
                  onChange={(e) => setTaskDeliverables(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTaskForm(false)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignTask}
                  disabled={!selectedStudentId || !taskTitle || !taskDeadline}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Assign Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Random Check Modal */}
      {showCheckForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Initiate Random Check</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select student...</option>
                  {data.students.map(s => (
                    <option key={s.id} value={s.id}>{s.studentId}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Check Type</label>
                <select
                  value={checkType}
                  onChange={(e) => setCheckType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="progress_question">Progress Question</option>
                  <option value="screenshot_request">Screenshot Request</option>
                  <option value="video_call">Video Call Request</option>
                </select>
              </div>
              {checkType === 'progress_question' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Question</label>
                  <textarea
                    value={checkQuestion}
                    onChange={(e) => setCheckQuestion(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    rows={3}
                    placeholder="E.g., Explain what you're working on right now..."
                  />
                </div>
              )}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                <Clock className="w-4 h-4 inline mr-1" />
                Student will have 10 minutes to respond.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCheckForm(false)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRandomCheck}
                  disabled={!selectedStudentId}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Initiate Check
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Review Modal */}
      {reviewingEvidence && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Review Evidence</h3>
            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-slate-600 mb-1">{reviewingEvidence.description}</p>
              {reviewingEvidence.evidenceUrl && (
                <a href={reviewingEvidence.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline text-sm">
                  View Evidence →
                </a>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Decision</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReviewStatus('approved')}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                      reviewStatus === 'approved' ? 'bg-green-600 text-white' : 'border border-slate-300'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => setReviewStatus('rejected')}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                      reviewStatus === 'rejected' ? 'bg-red-600 text-white' : 'border border-slate-300'
                    }`}
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  rows={3}
                  placeholder="Provide feedback to the student..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setReviewingEvidence(null)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReview}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
