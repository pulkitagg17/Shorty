-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "urls" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "short_code" VARCHAR(8) NOT NULL,
    "long_url" TEXT NOT NULL,
    "custom_alias" VARCHAR(20),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "expiry_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "urls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fingerprint" TEXT,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "revoked_at" TIMESTAMP,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blacklisted_urls" (
    "id" SERIAL NOT NULL,
    "pattern" TEXT NOT NULL,
    "pattern_type" VARCHAR(20) NOT NULL DEFAULT 'domain',
    "reason" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blacklisted_urls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics" (
    "event_id" UUID NOT NULL,
    "url_id" UUID NOT NULL,
    "short_code" VARCHAR(20) NOT NULL,
    "timestamp" TIMESTAMP NOT NULL,
    "ip_hash" VARCHAR(64) NOT NULL,
    "user_agent" VARCHAR(500),
    "referer" TEXT,
    "country" CHAR(2),
    "device_type" VARCHAR(10),
    "os" VARCHAR(50),
    "browser" VARCHAR(50),
    "is_bot" BOOLEAN,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("event_id")
);

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_lower_unique" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "urls_short_code_key" ON "urls"("short_code");

-- CreateIndex
CREATE UNIQUE INDEX "urls_custom_alias_key" ON "urls"("custom_alias");

-- CreateIndex
CREATE INDEX "urls_user_id_created_at_idx" ON "urls"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "urls_status_idx" ON "urls"("status");

-- CreateIndex
CREATE INDEX "urls_expiry_at_idx" ON "urls"("expiry_at");

-- CreateIndex
CREATE INDEX "urls_deleted_at_idx" ON "urls"("deleted_at");

-- CreateIndex
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions"("user_id");

-- CreateIndex
CREATE INDEX "auth_sessions_expires_at_idx" ON "auth_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "auth_sessions_revoked_idx" ON "auth_sessions"("revoked");

-- CreateIndex
CREATE INDEX "blacklisted_urls_is_active_idx" ON "blacklisted_urls"("is_active");

-- CreateIndex
CREATE INDEX "analytics_url_id_timestamp_idx" ON "analytics"("url_id", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_short_code_idx" ON "analytics"("short_code");

-- AddForeignKey
ALTER TABLE "urls" ADD CONSTRAINT "urls_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_url_id_fkey" FOREIGN KEY ("url_id") REFERENCES "urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
