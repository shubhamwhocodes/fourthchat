CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "api_key" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"key_prefix" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"rate_limit" integer DEFAULT 100 NOT NULL,
	"allowed_chatbot_ids" json,
	"allowed_domains" json,
	"allowed_ips" json,
	"total_requests" integer DEFAULT 0 NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	CONSTRAINT "api_key_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "api_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"api_key_id" text NOT NULL,
	"user_id" text NOT NULL,
	"chatbot_id" text NOT NULL,
	"model" text,
	"tokens_used" integer,
	"response_time" integer,
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fourthchat_knowledge_base" (
	"chatbot_id" text NOT NULL,
	"knowledge_base_id" text NOT NULL,
	CONSTRAINT "fourthchat_knowledge_base_chatbot_id_knowledge_base_id_pk" PRIMARY KEY("chatbot_id","knowledge_base_id")
);
--> statement-breakpoint
CREATE TABLE "chatbot_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"chatbot_id" text NOT NULL,
	"model" text DEFAULT 'gpt-4-turbo',
	"temperature" integer DEFAULT 7,
	"system_prompt" text,
	"business_about" text,
	"fallback_message" text,
	"avoid_words" text,
	"response_length" text DEFAULT 'medium',
	"tone" text DEFAULT 'neutral',
	"gender" text DEFAULT 'neutral',
	"languages" json DEFAULT '[]'::json,
	"use_emojis" boolean DEFAULT true,
	"use_bullet_points" boolean DEFAULT true,
	"dos" json,
	"donts" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chatbot_settings_chatbot_id_unique" UNIQUE("chatbot_id")
);
--> statement-breakpoint
CREATE TABLE "chatbot" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"status" text DEFAULT 'draft',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chatbot_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "connection" (
	"id" text PRIMARY KEY NOT NULL,
	"chatbot_id" text NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"config" json,
	"total_messages" integer DEFAULT 0 NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"chatbot_id" text NOT NULL,
	"external_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "embedding" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"content" text NOT NULL,
	"embedding" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_base" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"visibility" text DEFAULT 'private',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_source" (
	"id" text PRIMARY KEY NOT NULL,
	"knowledge_base_id" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"content" text,
	"original_path" text,
	"last_synced_at" timestamp,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"password" text,
	"plan" text DEFAULT 'free',
	"stripe_customer_id" text,
	"settings" json,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "webhook_delivery" (
	"id" text PRIMARY KEY NOT NULL,
	"connection_id" text NOT NULL,
	"message_id" text,
	"webhook_url" text NOT NULL,
	"payload" json NOT NULL,
	"status" text NOT NULL,
	"status_code" integer,
	"response" text,
	"error" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"delivered_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_usage" ADD CONSTRAINT "api_usage_api_key_id_api_key_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_key"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_usage" ADD CONSTRAINT "api_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_usage" ADD CONSTRAINT "api_usage_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fourthchat_knowledge_base" ADD CONSTRAINT "fourthchat_knowledge_base_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fourthchat_knowledge_base" ADD CONSTRAINT "fourthchat_knowledge_base_knowledge_base_id_knowledge_base_id_fk" FOREIGN KEY ("knowledge_base_id") REFERENCES "public"."knowledge_base"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatbot_settings" ADD CONSTRAINT "chatbot_settings_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatbot" ADD CONSTRAINT "chatbot_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connection" ADD CONSTRAINT "connection_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connection" ADD CONSTRAINT "connection_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_chatbot_id_chatbot_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embedding" ADD CONSTRAINT "embedding_source_id_knowledge_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."knowledge_source"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_base" ADD CONSTRAINT "knowledge_base_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_source" ADD CONSTRAINT "knowledge_source_knowledge_base_id_knowledge_base_id_fk" FOREIGN KEY ("knowledge_base_id") REFERENCES "public"."knowledge_base"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_delivery" ADD CONSTRAINT "webhook_delivery_connection_id_connection_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."connection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_delivery" ADD CONSTRAINT "webhook_delivery_message_id_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."message"("id") ON DELETE set null ON UPDATE no action;