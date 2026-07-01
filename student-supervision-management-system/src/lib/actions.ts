'use server';

import { db } from '@/db';
import { users, students, supervisors, tasks, attendance, activityLogs, workEvidence, productivityScores, randomChecks } from '@/db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { hashPassword, verifyPassword, createSession, getCurrentUser, logout as logoutFn } from '@/lib/auth';
import { generateId, getTodayDate, getCheckInStatus } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Authentication Actions
export async function login(email: string, password: string) {
  try {
    // Validate input
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }
    
    if (!email.includes('@')) {
      return { error: 'Please enter a valid email address' };
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      console.log('[Auth] User not found:', email);
      return { error: 'Invalid email or password' };
    }

    const validPassword = await verifyPassword(password, user.password);
    console.log('[Auth] Password verification:', { email, valid: validPassword });
    if (!validPassword) {
      return { error: 'Invalid email or password' };
    }

    try {
      await createSession(user.id);
      console.log('[Auth] Session created for user:', user.id);
    } catch (sessionErr: any) {
      console.error('[Auth] Session creation failed:', sessionErr);
      return { error: 'Session creation failed. Please try again.' };
    }

    // Return success with role so client can redirect
    return { 
      success: true, 
      role: user.role,
      message: 'Login successful'
    };
  } catch (error: any) {
    console.error('[Auth Error] Login failed:', error.message, error.stack);
    return { error: 'Login failed. Please try again later.' };
  }
}

export async function logout() {
  await logoutFn();
  redirect('/');
}

export async function register(data: {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: 'student' | 'supervisor';
  department: string;
  studentId?: string;
}) {
  try {
    // Validate input
    if (!data.email || !data.email.includes('@')) {
      return { error: 'Valid email is required' };
    }

    if (!data.password || data.password.length < 6) {
      return { error: 'Password must be at least 6 characters long' };
    }

    if (data.password !== data.confirmPassword) {
      return { error: 'Passwords do not match' };
    }

    if (!data.name || data.name.trim().length === 0) {
      return { error: 'Name is required' };
    }

    if (!data.department || data.department.trim().length === 0) {
      return { error: 'Department is required' };
    }

    if (data.role === 'student' && (!data.studentId || data.studentId.trim().length === 0)) {
      return { error: 'Student ID is required' };
    }

    // Check if email already exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, data.email));
    if (existingUser) {
      return { error: 'Email already registered. Please log in or use a different email.' };
    }

    const userId = generateId();
    const hashedPassword = await hashPassword(data.password);

    // Create user
    await db.insert(users).values({
      id: userId,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      name: data.name,
    });

    // Create student or supervisor record
    if (data.role === 'student') {
      await db.insert(students).values({
        id: generateId(),
        userId,
        studentId: data.studentId!,
        department: data.department,
      });
    } else if (data.role === 'supervisor') {
      await db.insert(supervisors).values({
        id: generateId(),
        userId,
        department: data.department,
      });
    }

    // Create session
    await createSession(userId);

    return { 
      success: true,
      role: data.role,
      message: 'Registration successful'
    };
  } catch (error: any) {
    console.error('[Registration Error]:', error);
    if (error.message.includes('unique')) {
      return { error: 'Email already registered' };
    }
    return { error: 'Registration failed. Please try again.' };
  }
}

// Student Actions
export async function getStudentDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'student') return null;

  const [student] = await db.select().from(students).where(eq(students.userId, user.id));
  if (!student) return null;

  const today = getTodayDate();

  // Get today's attendance
  const [todayAttendance] = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.studentId, student.id), eq(attendance.date, today)));

  // Get student's tasks
  const studentTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.studentId, student.id))
    .orderBy(desc(tasks.createdAt));

  // Get today's activity
  const [todayActivity] = await db
    .select()
    .from(activityLogs)
    .where(and(eq(activityLogs.studentId, student.id), eq(activityLogs.date, today)));

  // Get productivity score
  const [productivity] = await db
    .select()
    .from(productivityScores)
    .where(and(eq(productivityScores.studentId, student.id), eq(productivityScores.date, today)));

  // Get recent evidence
  const recentEvidence = await db
    .select()
    .from(workEvidence)
    .where(eq(workEvidence.studentId, student.id))
    .orderBy(desc(workEvidence.submittedAt))
    .limit(5);

  return {
    user,
    student,
    todayAttendance,
    tasks: studentTasks,
    todayActivity,
    productivity,
    recentEvidence,
  };
}

export async function checkIn(data: {
  workMode: 'remote' | 'office';
  location: { lat: number; lng: number };
  selfiePhoto?: string;
  ipAddress?: string;
  deviceFingerprint?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'student') {
      return { error: 'You must be logged in as a student to check in' };
    }

    if (!data.workMode || !['remote', 'office'].includes(data.workMode)) {
      return { error: 'Please select a valid work mode (remote or office)' };
    }

    if (!data.location || typeof data.location.lat !== 'number' || typeof data.location.lng !== 'number') {
      return { error: 'Location data is required. Please enable GPS permissions.' };
    }

    const [student] = await db.select().from(students).where(eq(students.userId, user.id));
    if (!student) {
      return { error: 'Student record not found. Please contact administrator.' };
    }

    const today = getTodayDate();
    
    // Check if already checked in today
    const [existingCheckIn] = await db
      .select()
      .from(attendance)
      .where(and(eq(attendance.studentId, student.id), eq(attendance.date, today)));
    
    if (existingCheckIn && existingCheckIn.checkInTime && !existingCheckIn.checkOutTime) {
      return { error: 'You are already checked in. Please check out before checking in again.' };
    }

    const checkInTime = new Date();
    const status = getCheckInStatus(checkInTime) === 'on_time' ? 'present' : 'late';

    await db.insert(attendance).values({
      id: generateId(),
      studentId: student.id,
      date: today,
      checkInTime,
      workMode: data.workMode,
      status,
      location: data.location,
      ipAddress: data.ipAddress,
      deviceFingerprint: data.deviceFingerprint,
      selfiePhoto: data.selfiePhoto,
      qrCodeScanned: data.workMode === 'office',
    });

    revalidatePath('/student');
    return { success: true, message: `Checked in successfully at ${checkInTime.toLocaleTimeString()}` };
  } catch (error: any) {
    console.error('[CheckIn Error]:', error);
    return { error: 'Check-in failed. Please try again.' };
  }
}

export async function checkOut(data: { dailySummary: string; challenges: string }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'student') {
      return { error: 'You must be logged in as a student to check out' };
    }

    if (!data.dailySummary || data.dailySummary.trim().length === 0) {
      return { error: 'Daily summary is required' };
    }

    if (data.dailySummary.trim().length < 10) {
      return { error: 'Daily summary must be at least 10 characters long' };
    }

    const [student] = await db.select().from(students).where(eq(students.userId, user.id));
    if (!student) {
      return { error: 'Student record not found. Please contact administrator.' };
    }

    const today = getTodayDate();

    const [existingCheckIn] = await db
      .select()
      .from(attendance)
      .where(and(eq(attendance.studentId, student.id), eq(attendance.date, today)));

    if (!existingCheckIn || !existingCheckIn.checkInTime) {
      return { error: 'You have not checked in today. Please check in first.' };
    }

    if (existingCheckIn.checkOutTime) {
      return { error: 'You have already checked out today.' };
    }

    await db
      .update(attendance)
      .set({
        checkOutTime: new Date(),
        dailySummary: data.dailySummary,
        challenges: data.challenges,
      })
      .where(and(eq(attendance.studentId, student.id), eq(attendance.date, today)));

    revalidatePath('/student');
    return { success: true, message: 'Checked out successfully' };
  } catch (error: any) {
    console.error('[CheckOut Error]:', error);
    return { error: 'Check-out failed. Please try again.' };
  }
}

export async function submitEvidence(data: {
  taskId: string;
  evidenceType: 'screenshot' | 'github_link' | 'document' | 'pdf' | 'source_code' | 'video' | 'git_commit';
  evidenceUrl?: string;
  description: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'student') {
      return { error: 'You must be logged in as a student to submit evidence' };
    }

    if (!data.taskId) {
      return { error: 'Task ID is required' };
    }

    if (!data.description || data.description.trim().length === 0) {
      return { error: 'Description is required' };
    }

    if (data.description.trim().length < 5) {
      return { error: 'Description must be at least 5 characters long' };
    }

    const [student] = await db.select().from(students).where(eq(students.userId, user.id));
    if (!student) {
      return { error: 'Student record not found' };
    }

    // Verify task exists and belongs to student
    const [task] = await db.select().from(tasks).where(eq(tasks.id, data.taskId));
    if (!task || task.studentId !== student.id) {
      return { error: 'Task not found or does not belong to you' };
    }

    await db.insert(workEvidence).values({
      id: generateId(),
      taskId: data.taskId,
      studentId: student.id,
      evidenceType: data.evidenceType,
      evidenceUrl: data.evidenceUrl,
      description: data.description,
      status: 'submitted',
    });

    revalidatePath('/student');
    return { success: true, message: 'Evidence submitted successfully' };
  } catch (error: any) {
    console.error('[Evidence Error]:', error);
    return { error: 'Failed to submit evidence. Please try again.' };
  }
}

export async function updateTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed') {
  const user = await getCurrentUser();
  if (!user || user.role !== 'student') throw new Error('Unauthorized');

  await db
    .update(tasks)
    .set({
      status,
      completedAt: status === 'completed' ? new Date() : null,
    })
    .where(eq(tasks.id, taskId));

  revalidatePath('/student');
  return { success: true };
}

// Supervisor Actions
export async function getSupervisorDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'supervisor') return null;

  const [supervisor] = await db.select().from(supervisors).where(eq(supervisors.userId, user.id));
  if (!supervisor) return null;

  const today = getTodayDate();

  // Get supervised students
  const supervisedStudents = await db
    .select()
    .from(students)
    .where(eq(students.supervisorId, supervisor.id));

  // Get today's attendance for all students
  const todayAttendance = await db
    .select()
    .from(attendance)
    .where(eq(attendance.date, today));

  // Get all tasks assigned by this supervisor
  const assignedTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.supervisorId, supervisor.id))
    .orderBy(desc(tasks.createdAt));

  // Get productivity scores
  const productivityData = await db
    .select()
    .from(productivityScores)
    .where(eq(productivityScores.date, today));

  // Get pending evidence
  const pendingEvidence = await db
    .select()
    .from(workEvidence)
    .where(eq(workEvidence.status, 'submitted'))
    .orderBy(desc(workEvidence.submittedAt))
    .limit(10);

  // Calculate stats
  const presentStudents = todayAttendance.filter(a => a.status !== 'absent').length;
  const remoteStudents = todayAttendance.filter(a => a.workMode === 'remote').length;
  const officeStudents = todayAttendance.filter(a => a.workMode === 'office').length;
  const highRiskStudents = productivityData.filter(p => p.riskLevel === 'high').length;

  return {
    user,
    supervisor,
    students: supervisedStudents,
    todayAttendance,
    tasks: assignedTasks,
    productivityData,
    pendingEvidence,
    stats: {
      totalStudents: supervisedStudents.length,
      presentStudents,
      remoteStudents,
      officeStudents,
      absentStudents: supervisedStudents.length - presentStudents,
      highRiskStudents,
    },
  };
}

export async function assignTask(data: {
  studentId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  deadline: Date;
  expectedDeliverables: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'supervisor') {
      return { error: 'You must be logged in as a supervisor to assign tasks' };
    }

    if (!data.studentId) {
      return { error: 'Student ID is required' };
    }

    if (!data.title || data.title.trim().length === 0) {
      return { error: 'Task title is required' };
    }

    if (!data.description || data.description.trim().length === 0) {
      return { error: 'Task description is required' };
    }

    if (!data.deadline || new Date(data.deadline) <= new Date()) {
      return { error: 'Deadline must be in the future' };
    }

    if (!data.expectedDeliverables || data.expectedDeliverables.trim().length === 0) {
      return { error: 'Expected deliverables are required' };
    }

    const [supervisor] = await db.select().from(supervisors).where(eq(supervisors.userId, user.id));
    if (!supervisor) {
      return { error: 'Supervisor record not found' };
    }

    // Verify student exists and is assigned to this supervisor
    const [student] = await db.select().from(students).where(eq(students.id, data.studentId));
    if (!student || student.supervisorId !== supervisor.id) {
      return { error: 'Student not found or is not assigned to you' };
    }

    await db.insert(tasks).values({
      id: generateId(),
      studentId: data.studentId,
      supervisorId: supervisor.id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      deadline: data.deadline,
      expectedDeliverables: data.expectedDeliverables,
      status: 'pending',
    });

    revalidatePath('/supervisor');
    return { success: true, message: 'Task assigned successfully' };
  } catch (error: any) {
    console.error('[Task Error]:', error);
    return { error: 'Failed to assign task. Please try again.' };
  }
}

export async function reviewEvidence(evidenceId: string, status: 'approved' | 'rejected', feedback: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'supervisor') {
      return { error: 'You must be logged in as a supervisor to review evidence' };
    }

    if (!evidenceId) {
      return { error: 'Evidence ID is required' };
    }

    if (!['approved', 'rejected'].includes(status)) {
      return { error: 'Invalid status. Must be approved or rejected.' };
    }

    if (!feedback || feedback.trim().length === 0) {
      return { error: 'Feedback is required' };
    }

    const [evidence] = await db.select().from(workEvidence).where(eq(workEvidence.id, evidenceId));
    if (!evidence) {
      return { error: 'Evidence not found' };
    }

    await db
      .update(workEvidence)
      .set({
        status,
        supervisorFeedback: feedback,
      })
      .where(eq(workEvidence.id, evidenceId));

    revalidatePath('/supervisor');
    return { success: true, message: `Evidence ${status} successfully` };
  } catch (error: any) {
    console.error('[Review Error]:', error);
    return { error: 'Failed to review evidence. Please try again.' };
  }
}

export async function initiateRandomCheck(data: {
  studentId: string;
  checkType: 'screenshot_request' | 'video_call' | 'progress_question';
  question?: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'supervisor') throw new Error('Unauthorized');

  const [supervisor] = await db.select().from(supervisors).where(eq(supervisors.userId, user.id));
  if (!supervisor) throw new Error('Supervisor not found');

  await db.insert(randomChecks).values({
    id: generateId(),
    studentId: data.studentId,
    supervisorId: supervisor.id,
    checkType: data.checkType,
    question: data.question,
    status: 'pending',
  });

  revalidatePath('/supervisor');
  return { success: true };
}

// Admin Actions
export async function getAdminDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') return null;

  const allUsers = await db.select().from(users);
  const allStudents = await db.select().from(students);
  const allSupervisors = await db.select().from(supervisors);

  const today = getTodayDate();
  const todayAttendance = await db.select().from(attendance).where(eq(attendance.date, today));
  const allProductivity = await db.select().from(productivityScores).where(eq(productivityScores.date, today));

  return {
    user,
    stats: {
      totalUsers: allUsers.length,
      totalStudents: allStudents.length,
      totalSupervisors: allSupervisors.length,
      presentToday: todayAttendance.filter(a => a.status !== 'absent').length,
      highRisk: allProductivity.filter(p => p.riskLevel === 'high').length,
      avgProductivity: allProductivity.length > 0
        ? Math.round(allProductivity.reduce((sum, p) => sum + (p.totalScore || 0), 0) / allProductivity.length)
        : 0,
    },
    users: allUsers,
    students: allStudents,
    supervisors: allSupervisors,
  };
}

export async function assignSupervisor(studentId: string, supervisorId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') throw new Error('Unauthorized');

  await db
    .update(students)
    .set({ supervisorId })
    .where(eq(students.id, studentId));

  revalidatePath('/admin');
  revalidatePath('/supervisor');
  return { success: true };
}

export async function generateReport(type: 'daily' | 'weekly' | 'monthly', studentId?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const today = new Date();
  let startDate: Date;
  let endDate = today;

  if (type === 'daily') {
    startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  } else if (type === 'weekly') {
    startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 7);
  } else {
    startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 1);
  }

  // Get attendance records
  const attendanceRecords = await db
    .select()
    .from(attendance)
    .where(
      studentId 
        ? eq(attendance.studentId, studentId)
        : undefined
    );

  // Get productivity scores
  const productivityRecords = await db
    .select()
    .from(productivityScores)
    .where(
      studentId
        ? eq(productivityScores.studentId, studentId)
        : undefined
    );

  // Calculate metrics
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(a => a.status === 'present').length;
  const lateDays = attendanceRecords.filter(a => a.status === 'late').length;
  const absentDays = attendanceRecords.filter(a => a.status === 'absent').length;
  
  const avgProductivity = productivityRecords.length > 0
    ? Math.round(productivityRecords.reduce((sum, p) => sum + (p.totalScore || 0), 0) / productivityRecords.length)
    : 0;

  const avgActiveHours = attendanceRecords.length > 0
    ? (attendanceRecords.reduce((sum, a) => {
        if (a.checkInTime && a.checkOutTime) {
          return sum + (a.checkOutTime.getTime() - a.checkInTime.getTime()) / (1000 * 60 * 60);
        }
        return sum;
      }, 0) / attendanceRecords.length)
    : 0;

  return {
    type,
    period: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    },
    metrics: {
      totalDays,
      presentDays,
      lateDays,
      absentDays,
      attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
      avgProductivity,
      avgActiveHours: Math.round(avgActiveHours * 10) / 10,
    },
    attendanceRecords,
    productivityRecords,
  };
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'supervisor' | 'admin';
  department?: string;
  studentId?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return { error: 'Only administrators can create new users' };
    }

    if (!data.email || !data.email.includes('@')) {
      return { error: 'Valid email is required' };
    }

    if (!data.password || data.password.length < 6) {
      return { error: 'Password must be at least 6 characters long' };
    }

    if (!data.name || data.name.trim().length === 0) {
      return { error: 'Name is required' };
    }

    if (!['student', 'supervisor', 'admin'].includes(data.role)) {
      return { error: 'Invalid role' };
    }

    // Check if email already exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, data.email));
    if (existingUser) {
      return { error: 'Email already registered' };
    }

    if ((data.role === 'student' || data.role === 'supervisor') && !data.department) {
      return { error: 'Department is required for students and supervisors' };
    }

    const userId = generateId();
    const hashedPassword = await hashPassword(data.password);

    await db.insert(users).values({
      id: userId,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      name: data.name,
    });

    if (data.role === 'student' && data.department && data.studentId) {
      if (!data.studentId.trim()) {
        return { error: 'Student ID is required' };
      }
      
      await db.insert(students).values({
        id: generateId(),
        userId,
        studentId: data.studentId,
        department: data.department,
      });
    } else if (data.role === 'supervisor' && data.department) {
      await db.insert(supervisors).values({
        id: generateId(),
        userId,
        department: data.department,
      });
    } else if (data.role === 'admin') {
      // Admin creation done, no additional setup needed
    }

    revalidatePath('/admin');
    return { success: true, message: 'User created successfully' };
  } catch (error: any) {
    console.error('[User Creation Error]:', error);
    if (error.message.includes('unique')) {
      return { error: 'Email already registered' };
    }
    return { error: 'Failed to create user. Please try again.' };
  }
}
