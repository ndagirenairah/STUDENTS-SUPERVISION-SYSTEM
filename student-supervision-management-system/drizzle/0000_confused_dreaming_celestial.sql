CREATE TABLE "activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"date" text NOT NULL,
	"active_time" integer DEFAULT 0,
	"idle_time" integer DEFAULT 0,
	"keyboard_activity" integer DEFAULT 0,
	"mouse_activity" integer DEFAULT 0,
	"app_usage" jsonb,
	"last_activity_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"date" text NOT NULL,
	"check_in_time" timestamp,
	"check_out_time" timestamp,
	"work_mode" text NOT NULL,
	"status" text NOT NULL,
	"location" jsonb,
	"ip_address" text,
	"device_fingerprint" text,
	"selfie_photo" text,
	"qr_code_scanned" boolean DEFAULT false,
	"daily_summary" text,
	"challenges" text
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "productivity_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"date" text NOT NULL,
	"attendance_score" integer DEFAULT 0,
	"activity_score" integer DEFAULT 0,
	"task_completion_score" integer DEFAULT 0,
	"evidence_score" integer DEFAULT 0,
	"supervisor_rating" integer DEFAULT 0,
	"total_score" integer DEFAULT 0,
	"risk_level" text DEFAULT 'low' NOT NULL,
	"risk_reasons" jsonb
);
--> statement-breakpoint
CREATE TABLE "random_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"supervisor_id" text NOT NULL,
	"check_type" text NOT NULL,
	"question" text,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"response" text,
	"response_time" integer,
	"status" text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "screenshots" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"image_url" text NOT NULL,
	"current_task" text,
	"app_in_focus" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"student_id" text NOT NULL,
	"department" text NOT NULL,
	"supervisor_id" text,
	"profile_photo" text,
	"registered_location" jsonb,
	"device_info" text,
	CONSTRAINT "students_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "supervisors" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"department" text NOT NULL,
	"max_students" integer DEFAULT 10
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"description" text,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"supervisor_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"priority" text NOT NULL,
	"deadline" timestamp NOT NULL,
	"expected_deliverables" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "work_evidence" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"student_id" text NOT NULL,
	"evidence_type" text NOT NULL,
	"evidence_url" text,
	"description" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"supervisor_feedback" text
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productivity_scores" ADD CONSTRAINT "productivity_scores_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "random_checks" ADD CONSTRAINT "random_checks_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "random_checks" ADD CONSTRAINT "random_checks_supervisor_id_supervisors_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."supervisors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screenshots" ADD CONSTRAINT "screenshots_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_supervisor_id_supervisors_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."supervisors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supervisors" ADD CONSTRAINT "supervisors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_supervisor_id_supervisors_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."supervisors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_evidence" ADD CONSTRAINT "work_evidence_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_evidence" ADD CONSTRAINT "work_evidence_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;