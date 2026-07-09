import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["student", "supervisor", "admin"] }).notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supervisors = pgTable("supervisors", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  department: text("department").notNull(),
  maxStudents: integer("max_students").default(10),
});

export const students = pgTable("students", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  studentId: text("student_id").notNull().unique(),
  department: text("department").notNull(),
  supervisorId: text("supervisor_id").references(() => supervisors.id),
  profilePhoto: text("profile_photo"),
  registeredLocation: jsonb("registered_location"),
  deviceInfo: text("device_info"),
});

export const admins = pgTable("admins", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
});

export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id),
  date: text("date").notNull(),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  workMode: text("work_mode", { enum: ["remote", "office"] }).notNull(),
  status: text("status", {
    enum: ["present", "late", "absent"],
  }).notNull(),
  location: jsonb("location"),
  ipAddress: text("ip_address"),
  deviceFingerprint: text("device_fingerprint"),
  selfiePhoto: text("selfie_photo"),
  qrCodeScanned: boolean("qr_code_scanned").default(false),
  dailySummary: text("daily_summary"),
  challenges: text("challenges"),
});

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id),
  supervisorId: text("supervisor_id")
    .notNull()
    .references(() => supervisors.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority", { enum: ["low", "medium", "high"] }).notNull(),
  deadline: timestamp("deadline").notNull(),
  expectedDeliverables: text("expected_deliverables").notNull(),
  status: text("status", {
    enum: ["pending", "in_progress", "completed", "approved", "rejected"],
  })
    .default("pending")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id),
  date: text("date").notNull(),
  activeTime: integer("active_time").default(0),
  idleTime: integer("idle_time").default(0),
  keyboardActivity: integer("keyboard_activity").default(0),
  mouseActivity: integer("mouse_activity").default(0),
  appUsage: jsonb("app_usage"),
  lastActivityAt: timestamp("last_activity_at"),
});

export const screenshots = pgTable("screenshots", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  imageUrl: text("image_url").notNull(),
  currentTask: text("current_task"),
  appInFocus: text("app_in_focus"),
});

export const workEvidence = pgTable("work_evidence", {
  id: text("id").primaryKey(),
  taskId: text("task_id")
    .notNull()
    .references(() => tasks.id),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id),
  evidenceType: text("evidence_type", {
    enum: [
      "screenshot",
      "github_link",
      "document",
      "pdf",
      "source_code",
      "video",
      "git_commit",
    ],
  }).notNull(),
  evidenceUrl: text("evidence_url"),
  description: text("description"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  status: text("status", {
    enum: ["submitted", "approved", "rejected"],
  })
    .default("submitted")
    .notNull(),
  supervisorFeedback: text("supervisor_feedback"),
});

export const productivityScores = pgTable("productivity_scores", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id),
  date: text("date").notNull(),
  attendanceScore: integer("attendance_score").default(0),
  activityScore: integer("activity_score").default(0),
  taskCompletionScore: integer("task_completion_score").default(0),
  evidenceScore: integer("evidence_score").default(0),
  supervisorRating: integer("supervisor_rating").default(0),
  totalScore: integer("total_score").default(0),
  riskLevel: text("risk_level", {
    enum: ["low", "medium", "high"],
  })
    .default("low")
    .notNull(),
  riskReasons: jsonb("risk_reasons"),
});

export const randomChecks = pgTable("random_checks", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id),
  supervisorId: text("supervisor_id")
    .notNull()
    .references(() => supervisors.id),
  checkType: text("check_type", {
    enum: ["screenshot_request", "video_call", "progress_question"],
  }).notNull(),
  question: text("question"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
  response: text("response"),
  responseTime: integer("response_time"),
  status: text("status", {
    enum: ["pending", "responded", "missed"],
  })
    .default("pending")
    .notNull(),
});

export const departments = pgTable("departments", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemSettings = pgTable("system_settings", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
