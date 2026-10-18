CREATE TABLE "doctor_claims" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"doctor_id" varchar(50) NOT NULL,
	"claimant_name" varchar(150) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"email" varchar(150),
	"registration_number" varchar(100) NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"review_note" text,
	"reviewed_by" varchar(50),
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctor_links" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"doctor_id" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "establishment_members" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"establishment_id" varchar(50) NOT NULL,
	"role" varchar(20) NOT NULL,
	"invited_by" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"kind" varchar(20) NOT NULL,
	"establishment_id" varchar(50),
	"doctor_id" varchar(50),
	"role" varchar(20) NOT NULL,
	"name" varchar(150) DEFAULT '' NOT NULL,
	"phone" varchar(30) DEFAULT '' NOT NULL,
	"code_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"used_by" varchar(50),
	"revoked_at" timestamp with time zone,
	"created_by" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_code_hash_unique" UNIQUE("code_hash")
);
--> statement-breakpoint
ALTER TABLE "doctor_claims" ADD CONSTRAINT "doctor_claims_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_links" ADD CONSTRAINT "doctor_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_links" ADD CONSTRAINT "doctor_links_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "establishment_members" ADD CONSTRAINT "establishment_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "establishment_members" ADD CONSTRAINT "establishment_members_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "doctor_claims_status" ON "doctor_claims" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "doctor_links_doctor" ON "doctor_links" USING btree ("doctor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "doctor_links_user" ON "doctor_links" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "establishment_members_user_establishment" ON "establishment_members" USING btree ("user_id","establishment_id");--> statement-breakpoint
CREATE INDEX "invitations_establishment" ON "invitations" USING btree ("establishment_id");--> statement-breakpoint
CREATE INDEX "invitations_doctor" ON "invitations" USING btree ("doctor_id");