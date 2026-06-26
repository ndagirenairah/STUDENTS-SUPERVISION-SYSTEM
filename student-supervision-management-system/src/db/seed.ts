import { db } from '@/db';
import { users, students, supervisors, admins, departments, tasks, attendance, activityLogs, workEvidence, productivityScores } from '@/db/schema';
import { hashPassword } from '@/lib/auth';
import { generateId, getTodayDate } from '@/lib/utils';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Check if already seeded
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    console.log('✅ Database already seeded');
    return;
  }

  // Create departments
  const deptIds = {
    software: generateId(),
    design: generateId(),
    research: generateId(),
  };

  await db.insert(departments).values([
    { id: deptIds.software, name: 'Software Engineering', description: 'Software development department' },
    { id: deptIds.design, name: 'UI/UX Design', description: 'Design department' },
    { id: deptIds.research, name: 'Research & Development', description: 'R&D department' },
  ]);

  // Create users
  const userIds = {
    admin: generateId(),
    supervisor1: generateId(),
    supervisor2: generateId(),
    student1: generateId(),
    student2: generateId(),
    student3: generateId(),
    student4: generateId(),
  };

  await db.insert(users).values([
    { id: userIds.admin, email: 'admin@system.com', password: await hashPassword('admin123'), role: 'admin', name: 'System Administrator' },
    { id: userIds.supervisor1, email: 'supervisor@system.com', password: await hashPassword('supervisor123'), role: 'supervisor', name: 'Dr. Sarah Johnson' },
    { id: userIds.supervisor2, email: 'john.smith@system.com', password: await hashPassword('supervisor123'), role: 'supervisor', name: 'Prof. John Smith' },
    { id: userIds.student1, email: 'alice@student.com', password: await hashPassword('student123'), role: 'student', name: 'Alice Chen' },
    { id: userIds.student2, email: 'bob@student.com', password: await hashPassword('student123'), role: 'student', name: 'Bob Williams' },
    { id: userIds.student3, email: 'carol@student.com', password: await hashPassword('student123'), role: 'student', name: 'Carol Davis' },
    { id: userIds.student4, email: 'david@student.com', password: await hashPassword('student123'), role: 'student', name: 'David Martinez' },
  ]);

  // Create supervisors
  const supervisorIds = {
    supervisor1: generateId(),
    supervisor2: generateId(),
  };

  await db.insert(supervisors).values([
    { id: supervisorIds.supervisor1, userId: userIds.supervisor1, department: 'Software Engineering', maxStudents: 10 },
    { id: supervisorIds.supervisor2, userId: userIds.supervisor2, department: 'UI/UX Design', maxStudents: 8 },
  ]);

  // Create admin
  await db.insert(admins).values([
    { id: generateId(), userId: userIds.admin },
  ]);

  // Create students
  const studentIds = {
    student1: generateId(),
    student2: generateId(),
    student3: generateId(),
    student4: generateId(),
  };

  await db.insert(students).values([
    { id: studentIds.student1, userId: userIds.student1, studentId: 'STU001', department: 'Software Engineering', supervisorId: supervisorIds.supervisor1, deviceInfo: 'Chrome on Windows', registeredLocation: { lat: 37.7749, lng: -122.4194 } },
    { id: studentIds.student2, userId: userIds.student2, studentId: 'STU002', department: 'Software Engineering', supervisorId: supervisorIds.supervisor1, deviceInfo: 'Firefox on macOS', registeredLocation: { lat: 37.7749, lng: -122.4194 } },
    { id: studentIds.student3, userId: userIds.student3, studentId: 'STU003', department: 'UI/UX Design', supervisorId: supervisorIds.supervisor2, deviceInfo: 'Safari on macOS', registeredLocation: { lat: 37.7749, lng: -122.4194 } },
    { id: studentIds.student4, userId: userIds.student4, studentId: 'STU004', department: 'Research & Development', supervisorId: supervisorIds.supervisor1, deviceInfo: 'Edge on Windows', registeredLocation: { lat: 37.7749, lng: -122.4194 } },
  ]);

  // Create sample tasks
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const taskIds = [generateId(), generateId(), generateId(), generateId(), generateId()];

  await db.insert(tasks).values([
    {
      id: taskIds[0],
      studentId: studentIds.student1,
      supervisorId: supervisorIds.supervisor1,
      title: 'Develop Student Dashboard',
      description: 'Create a responsive dashboard showing attendance, tasks, and productivity metrics',
      priority: 'high',
      deadline: nextWeek,
      expectedDeliverables: 'Fully functional dashboard with charts and real-time updates',
      status: 'in_progress',
    },
    {
      id: taskIds[1],
      studentId: studentIds.student1,
      supervisorId: supervisorIds.supervisor1,
      title: 'Implement Authentication System',
      description: 'Build secure login and session management',
      priority: 'high',
      deadline: tomorrow,
      expectedDeliverables: 'Working login/logout with session persistence',
      status: 'completed',
      completedAt: new Date(),
    },
    {
      id: taskIds[2],
      studentId: studentIds.student2,
      supervisorId: supervisorIds.supervisor1,
      title: 'Database Schema Design',
      description: 'Design and implement database schema for the entire system',
      priority: 'medium',
      deadline: nextWeek,
      expectedDeliverables: 'Optimized database schema with proper indexes',
      status: 'pending',
    },
    {
      id: taskIds[3],
      studentId: studentIds.student3,
      supervisorId: supervisorIds.supervisor2,
      title: 'Design Mobile UI Mockups',
      description: 'Create mobile-responsive designs for the supervision app',
      priority: 'medium',
      deadline: nextWeek,
      expectedDeliverables: 'Figma mockups for all major screens',
      status: 'in_progress',
    },
    {
      id: taskIds[4],
      studentId: studentIds.student4,
      supervisorId: supervisorIds.supervisor1,
      title: 'Research Activity Tracking Methods',
      description: 'Investigate best practices for activity monitoring',
      priority: 'low',
      deadline: nextWeek,
      expectedDeliverables: 'Research report with recommendations',
      status: 'pending',
    },
  ]);

  // Create attendance records for today
  const todayDate = getTodayDate();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().split('T')[0];

  await db.insert(attendance).values([
    {
      id: generateId(),
      studentId: studentIds.student1,
      date: todayDate,
      checkInTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 15),
      workMode: 'office',
      status: 'present',
      location: { lat: 37.7749, lng: -122.4194 },
      ipAddress: '192.168.1.100',
      qrCodeScanned: true,
    },
    {
      id: generateId(),
      studentId: studentIds.student2,
      date: todayDate,
      checkInTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 45),
      workMode: 'remote',
      status: 'late',
      location: { lat: 37.7749, lng: -122.4194 },
      ipAddress: '192.168.1.101',
    },
    {
      id: generateId(),
      studentId: studentIds.student3,
      date: todayDate,
      checkInTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 55),
      workMode: 'remote',
      status: 'present',
      location: { lat: 37.7749, lng: -122.4194 },
      ipAddress: '192.168.1.102',
    },
    {
      id: generateId(),
      studentId: studentIds.student1,
      date: yesterdayDate,
      checkInTime: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 8, 10),
      checkOutTime: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 17, 5),
      workMode: 'office',
      status: 'present',
      location: { lat: 37.7749, lng: -122.4194 },
      dailySummary: 'Completed dashboard UI components and fixed authentication bugs',
      challenges: 'Minor issues with chart rendering on mobile',
    },
  ]);

  // Create activity logs
  await db.insert(activityLogs).values([
    {
      id: generateId(),
      studentId: studentIds.student1,
      date: todayDate,
      activeTime: 390,
      idleTime: 45,
      keyboardActivity: 2500,
      mouseActivity: 3800,
      appUsage: { 'VS Code': 180, 'Chrome': 120, 'Terminal': 90 },
      lastActivityAt: new Date(),
    },
    {
      id: generateId(),
      studentId: studentIds.student2,
      date: todayDate,
      activeTime: 320,
      idleTime: 115,
      keyboardActivity: 1800,
      mouseActivity: 2400,
      appUsage: { 'VS Code': 200, 'Chrome': 80, 'Postman': 40 },
      lastActivityAt: new Date(),
    },
    {
      id: generateId(),
      studentId: studentIds.student3,
      date: todayDate,
      activeTime: 420,
      idleTime: 15,
      keyboardActivity: 1200,
      mouseActivity: 4500,
      appUsage: { 'Figma': 300, 'Chrome': 90, 'Slack': 30 },
      lastActivityAt: new Date(),
    },
  ]);

  // Create work evidence
  await db.insert(workEvidence).values([
    {
      id: generateId(),
      taskId: taskIds[1],
      studentId: studentIds.student1,
      evidenceType: 'github_link',
      evidenceUrl: 'https://github.com/student/auth-system',
      description: 'Implemented JWT authentication with refresh tokens',
      status: 'approved',
      supervisorFeedback: 'Excellent work! Clean code and good security practices.',
    },
    {
      id: generateId(),
      taskId: taskIds[0],
      studentId: studentIds.student1,
      evidenceType: 'screenshot',
      evidenceUrl: '/evidence/dashboard-progress.png',
      description: 'Dashboard UI 80% complete',
      status: 'submitted',
    },
  ]);

  // Create productivity scores
  await db.insert(productivityScores).values([
    {
      id: generateId(),
      studentId: studentIds.student1,
      date: todayDate,
      attendanceScore: 95,
      activityScore: 88,
      taskCompletionScore: 85,
      evidenceScore: 90,
      supervisorRating: 92,
      totalScore: 90,
      riskLevel: 'low',
      riskReasons: [],
    },
    {
      id: generateId(),
      studentId: studentIds.student2,
      date: todayDate,
      attendanceScore: 70,
      activityScore: 65,
      taskCompletionScore: 60,
      evidenceScore: 50,
      supervisorRating: 68,
      totalScore: 63,
      riskLevel: 'medium',
      riskReasons: ['Late check-in', 'High idle time', 'Missing evidence for some tasks'],
    },
    {
      id: generateId(),
      studentId: studentIds.student3,
      date: todayDate,
      attendanceScore: 98,
      activityScore: 95,
      taskCompletionScore: 80,
      evidenceScore: 85,
      supervisorRating: 90,
      totalScore: 90,
      riskLevel: 'low',
      riskReasons: [],
    },
  ]);

  console.log('✅ Database seeded successfully');
  console.log('\n📋 Demo Credentials:');
  console.log('Admin: admin@system.com / admin123');
  console.log('Supervisor: supervisor@system.com / supervisor123');
  console.log('Student 1: alice@student.com / student123');
  console.log('Student 2: bob@student.com / student123');
  console.log('Student 3: carol@student.com / student123');
  console.log('Student 4: david@student.com / student123');
}
