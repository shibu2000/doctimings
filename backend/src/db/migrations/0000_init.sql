CREATE TABLE "audit_logs" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_id" varchar(50) NOT NULL,
	"actor_name" varchar(150) NOT NULL,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(50) NOT NULL,
	"entity_name" varchar(150) NOT NULL,
	"details" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"specialty" varchar(100) NOT NULL,
	"registration_number" varchar(100) NOT NULL,
	"council" varchar(150) DEFAULT 'West Bengal Medical Council' NOT NULL,
	"qualifications" varchar(255) NOT NULL,
	"experience_years" integer DEFAULT 0 NOT NULL,
	"primary_phone" varchar(30) NOT NULL,
	"email" varchar(150),
	"languages" jsonb DEFAULT '["Bengali","English"]'::jsonb NOT NULL,
	"photo_url" text,
	"verification_status" varchar(50) DEFAULT 'Verified' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"affiliated_establishment_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "establishments" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"type" varchar(50) DEFAULT 'Doctor Chamber' NOT NULL,
	"district" varchar(100) NOT NULL,
	"sub_district" varchar(100) NOT NULL,
	"address" text NOT NULL,
	"pin_code" varchar(10) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"proprietor_name" varchar(150) NOT NULL,
	"license_number" varchar(100) NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"verification_status" varchar(50) DEFAULT 'Verified' NOT NULL,
	"account_status" varchar(50) DEFAULT 'Platform Managed' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health_articles" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"topic_id" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"summary" text NOT NULL,
	"content" text NOT NULL,
	"language" varchar(20) DEFAULT 'BOTH' NOT NULL,
	"read_time_min" integer DEFAULT 3 NOT NULL,
	"status" varchar(30) DEFAULT 'Published' NOT NULL,
	"views_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "health_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "health_topics" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"slug" varchar(150) NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50) DEFAULT 'Stethoscope',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "health_topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "practice_locations" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"establishment_id" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	"room_designation" varchar(100) NOT NULL,
	"floor" varchar(50) DEFAULT 'Ground Floor' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"doctor_id" varchar(50),
	"establishment_id" varchar(50),
	"issue_type" varchar(50) NOT NULL,
	"issue_title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"severity" varchar(30) DEFAULT 'medium' NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"source" varchar(50) DEFAULT 'Mobile App Patient' NOT NULL,
	"reporter_phone" varchar(30),
	"resolution_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_overrides" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"doctor_id" varchar(50) NOT NULL,
	"establishment_id" varchar(50) NOT NULL,
	"date" varchar(20) NOT NULL,
	"day_of_week" varchar(30) NOT NULL,
	"override_type" varchar(30) NOT NULL,
	"standard_shift" varchar(100) NOT NULL,
	"new_start_time" varchar(20),
	"new_end_time" varchar(20),
	"public_reason" text NOT NULL,
	"internal_note" text DEFAULT '' NOT NULL,
	"reported_by" varchar(150) DEFAULT 'Operations Desk' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"doctor_id" varchar(50) NOT NULL,
	"establishment_id" varchar(50) NOT NULL,
	"practice_location_id" varchar(50) NOT NULL,
	"day_of_week" varchar(30) NOT NULL,
	"start_time" varchar(20) NOT NULL,
	"end_time" varchar(20) NOT NULL,
	"shift_name" varchar(100) NOT NULL,
	"room_number" varchar(50) NOT NULL,
	"token_policy" varchar(100) DEFAULT 'First Come First Served' NOT NULL,
	"max_tokens" integer DEFAULT 30 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(150) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(50) DEFAULT 'Patient' NOT NULL,
	"status" varchar(30) DEFAULT 'Active' NOT NULL,
	"last_active" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "health_articles" ADD CONSTRAINT "health_articles_topic_id_health_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."health_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_locations" ADD CONSTRAINT "practice_locations_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_overrides" ADD CONSTRAINT "schedule_overrides_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_overrides" ADD CONSTRAINT "schedule_overrides_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action;