'use client';

import { useState, useRef, useEffect } from 'react';
import { checkIn, checkOut, submitEvidence, updateTaskStatus } from '@/lib/actions';
import { formatTime } from '@/lib/utils';
import {
  LogOut, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp,
  MapPin, Camera, Upload, Play, Pause, FileText, Code, Activity,
  Wifi, User, Calendar, Target
} from 'lucide-react';
import AIInsightsPanel from '@/components/ai-insights-panel';

interface DashboardData {
  user: any;
  student: any;
  todayAttendance: any;
  tasks: any[];
  todayActivity: any;
  productivity: any;
  recentEvidence: any[];
}

export default function StudentDashboardClient({ data, logoutAction }: { data: DashboardData; logoutAction: () => void }) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'checkin' | 'evidence'>('dashboard');
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showCheckOutForm, setShowCheckOutForm] = useState(false);
  const [dailySummary, setDailySummary] = useState('');
  const [challenges, setChallenges] = useState('');
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [evidenceType, setEvidenceType] = useState('github_link');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Simulated activity tracking
  const [activeTime, setActiveTime] = useState(data.todayActivity?.activeTime || 0);
  const [idleTime, setIdleTime] = useState(data.todayActivity?.idleTime || 0);

  useEffect(() => {
    if (!data.todayAttendance) return;
    
    // Simulate activity tracking
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setActiveTime((prev: number) => prev + 1);
      } else {
        setIdleTime((prev: number) => prev + 1);
      }
    }, 60000); // every minute

    return () => clearInterval(interval);
  }, [data.todayAttendance]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      alert('Unable to access camera. Please grant permission.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const captureSelfie = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const photo = canvas.toDataURL('image/jpeg');
      setSelfiePhoto(photo);
      stopCamera();
    }
  };

  const handleCheckIn = async (workMode: 'remote' | 'office') => {
    if (!selfiePhoto) {
      alert('Please capture a selfie first for identity verification.');
      return;
    }

    setCheckingIn(true);
    try {
      // Get GPS location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      await checkIn({
        workMode,
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        selfiePhoto,
        ipAddress: '192.168.1.100',
        deviceFingerprint: navigator.userAgent,
      });

      window.location.reload();
    } catch (err) {
      alert('Failed to check in. Please enable location services and try again.');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      await checkOut({ dailySummary, challenges });
      window.location.reload();
    } catch (err) {
      alert('Failed to check out. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleSubmitEvidence = async () => {
    try {
      await submitEvidence({
        taskId: selectedTaskId,
        evidenceType: evidenceType as any,
        evidenceUrl,
        description: evidenceDesc,
      });
      setShowEvidenceForm(false);
      setEvidenceUrl('');
      setEvidenceDesc('');
      window.location.reload();
    } catch (err) {
      alert('Failed to submit evidence.');
    }
  };

  const productivityScore = data.productivity?.totalScore || 0;
  const riskLevel = data.productivity?.riskLevel || 'low';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Student Dashboard</h1>
              <p className="text-sm text-slate-600">{data.user.name} • {data.student.studentId}</p>
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
            {['dashboard', 'tasks', 'checkin', 'evidence'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'checkin' ? 'Check In/Out' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Productivity Score</p>
                    <p className="text-3xl font-bold text-slate-900">{productivityScore}%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-600" />
                </div>
                <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-600"
                    style={{ width: `${productivityScore}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Active Time</p>
                    <p className="text-3xl font-bold text-slate-900">{formatTime(activeTime)}</p>
                  </div>
                  <Activity className="w-10 h-10 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Idle Time</p>
                    <p className="text-3xl font-bold text-slate-900">{formatTime(idleTime)}</p>
                  </div>
                  <Pause className="w-10 h-10 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Risk Level</p>
                    <p className={`text-3xl font-bold capitalize ${
                      riskLevel === 'low' ? 'text-green-600' : 
                      riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>{riskLevel}</p>
                  </div>
                  <AlertTriangle className={`w-10 h-10 ${
                    riskLevel === 'low' ? 'text-green-600' : 
                    riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
            </div>

            {/* Today's Status */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Today's Attendance
                </h3>
                {data.todayAttendance ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Status</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        data.todayAttendance.status === 'present' ? 'bg-green-100 text-green-700' :
                        data.todayAttendance.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{data.todayAttendance.status}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Check-in Time</span>
                      <span className="font-medium">
                        {new Date(data.todayAttendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Work Mode</span>
                      <span className="font-medium capitalize">{data.todayAttendance.workMode}</span>
                    </div>
                    {data.todayAttendance.checkOutTime && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Check-out Time</span>
                        <span className="font-medium">
                          {new Date(data.todayAttendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>You haven't checked in yet today</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Task Overview
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Pending</span>
                    <span className="font-medium">{data.tasks.filter(t => t.status === 'pending').length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">In Progress</span>
                    <span className="font-medium">{data.tasks.filter(t => t.status === 'in_progress').length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Completed</span>
                    <span className="font-medium text-green-600">{data.tasks.filter(t => t.status === 'completed').length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Approved</span>
                    <span className="font-medium text-blue-600">{data.tasks.filter(t => t.status === 'approved').length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Live Prediction */}
            {(() => {
              const completedTasks = data.tasks.filter(t => t.status === 'completed' || t.status === 'approved').length;
              const aiFeatures = {
                checkInTime: data.todayAttendance ? Math.max(0, Math.round((new Date(data.todayAttendance.checkInTime).getTime() - new Date(new Date().setHours(8, 0, 0, 0)).getTime()) / 60000)) : 0,
                workMode: (data.todayAttendance?.workMode as 'remote' | 'office') || 'remote',
                activeHours: (data.todayActivity?.activeTime || 0) / 60,
                idleHours: (data.todayActivity?.idleTime || 0) / 60,
                tasksAssigned: data.tasks.length,
                tasksCompleted: completedTasks,
                evidenceUploaded: data.recentEvidence.length,
                screenshotCount: Math.floor((data.todayActivity?.activeTime || 0) / 15),
                supervisorRating: data.productivity?.supervisorRating || 70,
                responseTime: 5,
              };
              return (
                <AIInsightsPanel features={aiFeatures} showDetails={true} />
              );
            })()}

            {/* Productivity Breakdown */}
            {data.productivity && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Productivity Breakdown</h3>
                <div className="grid md:grid-cols-5 gap-4">
                  {[
                    { label: 'Attendance', value: data.productivity.attendanceScore },
                    { label: 'Activity', value: data.productivity.activityScore },
                    { label: 'Task Completion', value: data.productivity.taskCompletionScore },
                    { label: 'Evidence', value: data.productivity.evidenceScore },
                    { label: 'Supervisor Rating', value: data.productivity.supervisorRating },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-2">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle cx="40" cy="40" r="35" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                          <circle
                            cx="40" cy="40" r="35" fill="none" stroke="#3b82f6" strokeWidth="6"
                            strokeDasharray={`${(item.value || 0) * 2.2} 220`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">
                          {item.value || 0}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">My Tasks</h2>
            {data.tasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center text-slate-500">
                No tasks assigned yet
              </div>
            ) : (
              data.tasks.map((task) => (
                <div key={task.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{task.title}</h3>
                      <p className="text-slate-600 text-sm mt-1">{task.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>{task.priority}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                    <span>📅 Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                      task.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      task.status === 'completed' ? 'bg-green-100 text-green-700' :
                      task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>{task.status}</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-sm mb-4">
                    <strong>Expected Deliverables:</strong> {task.expectedDeliverables}
                  </div>
                  <div className="flex gap-2">
                    {task.status === 'pending' && (
                      <button
                        onClick={async () => {
                          await updateTaskStatus(task.id, 'in_progress');
                          window.location.reload();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        Start Task
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <button
                        onClick={async () => {
                          await updateTaskStatus(task.id, 'completed');
                          window.location.reload();
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                      >
                        Mark Complete
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setShowEvidenceForm(true);
                      }}
                      className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-700"
                    >
                      Submit Evidence
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'checkin' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Check In / Check Out</h2>
            
            {!data.todayAttendance ? (
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Camera className="w-5 h-5" /> Identity Verification
                  </h3>
                  {!cameraActive && !selfiePhoto && (
                    <button
                      onClick={startCamera}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Start Camera
                    </button>
                  )}
                  {cameraActive && (
                    <div className="space-y-3">
                      <video ref={videoRef} autoPlay className="w-full rounded-lg bg-slate-900" />
                      <button
                        onClick={captureSelfie}
                        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Capture Selfie
                      </button>
                    </div>
                  )}
                  {selfiePhoto && (
                    <div className="space-y-2">
                      <img src={selfiePhoto} alt="Selfie" className="w-full rounded-lg" />
                      <button
                        onClick={() => setSelfiePhoto(null)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Retake Photo
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Select Work Mode
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleCheckIn('office')}
                      disabled={checkingIn || !selfiePhoto}
                      className="p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Wifi className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="font-medium">Office</p>
                      <p className="text-xs text-slate-600 mt-1">GPS + QR Code</p>
                    </button>
                    <button
                      onClick={() => handleCheckIn('remote')}
                      disabled={checkingIn || !selfiePhoto}
                      className="p-6 border-2 border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MapPin className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <p className="font-medium">Remote</p>
                      <p className="text-xs text-slate-600 mt-1">GPS + IP</p>
                    </button>
                  </div>
                </div>
              </div>
            ) : !data.todayAttendance.checkOutTime ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">You are checked in</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Since {new Date(data.todayAttendance.checkInTime).toLocaleTimeString()}
                  </p>
                </div>
                
                {!showCheckOutForm ? (
                  <button
                    onClick={() => setShowCheckOutForm(true)}
                    className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Check Out
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Daily Summary</label>
                      <textarea
                        value={dailySummary}
                        onChange={(e) => setDailySummary(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        rows={3}
                        placeholder="What did you accomplish today?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Challenges Faced</label>
                      <textarea
                        value={challenges}
                        onChange={(e) => setChallenges(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        rows={2}
                        placeholder="Any challenges you encountered?"
                      />
                    </div>
                    <button
                      onClick={handleCheckOut}
                      disabled={checkingOut || !dailySummary}
                      className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {checkingOut ? 'Checking out...' : 'Confirm Check Out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Checked out for today</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    {data.todayAttendance.dailySummary}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recent Evidence Submissions</h2>
            {data.recentEvidence.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center text-slate-500">
                No evidence submitted yet
              </div>
            ) : (
              data.recentEvidence.map((ev) => (
                <div key={ev.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-slate-600" />
                        <span className="font-medium capitalize">{ev.evidenceType.replace('_', ' ')}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          ev.status === 'approved' ? 'bg-green-100 text-green-700' :
                          ev.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{ev.status}</span>
                      </div>
                      <p className="text-slate-600">{ev.description}</p>
                      {ev.evidenceUrl && (
                        <a href={ev.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                          View Evidence →
                        </a>
                      )}
                      {ev.supervisorFeedback && (
                        <div className="mt-3 bg-slate-50 p-3 rounded-lg text-sm">
                          <strong>Feedback:</strong> {ev.supervisorFeedback}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(ev.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Evidence Modal */}
      {showEvidenceForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Submit Work Evidence</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Evidence Type</label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="github_link">GitHub Link</option>
                  <option value="git_commit">Git Commit</option>
                  <option value="screenshot">Screenshot</option>
                  <option value="document">Document</option>
                  <option value="pdf">PDF</option>
                  <option value="source_code">Source Code</option>
                  <option value="video">Video Demo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL / Link (optional)</label>
                <input
                  type="text"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={evidenceDesc}
                  onChange={(e) => setEvidenceDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  rows={3}
                  placeholder="Describe your work..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEvidenceForm(false)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitEvidence}
                  disabled={!evidenceDesc}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
