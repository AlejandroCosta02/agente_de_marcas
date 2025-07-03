-- CreateTable
CREATE TABLE "Marca" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "acta" TEXT NOT NULL,
    "clase" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "renovar" TIMESTAMP(6) NOT NULL,
    "vencimiento" TIMESTAMP(6) NOT NULL,
    "anotaciones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "oposicion" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "user_email" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "titularId" TEXT NOT NULL,

    CONSTRAINT "Marca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Titular" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Titular_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "provider" VARCHAR(255) NOT NULL,
    "provider_account_id" VARCHAR(255) NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" BIGINT,
    "id_token" TEXT,
    "scope" TEXT,
    "session_state" TEXT,
    "token_type" VARCHAR(255),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marca_files" (
    "id" SERIAL NOT NULL,
    "marca_id" UUID NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "size" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "s3_url" TEXT,
    "s3_key" TEXT,

    CONSTRAINT "marca_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marcas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "marca" VARCHAR(60) NOT NULL,
    "renovar" DATE NOT NULL,
    "vencimiento" DATE NOT NULL,
    "djumt" DATE NOT NULL,
    "titular_nombre" VARCHAR(100) NOT NULL,
    "titular_email" VARCHAR(100) NOT NULL,
    "titular_telefono" VARCHAR(20) NOT NULL,
    "anotaciones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "user_email" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "oposicion" JSONB DEFAULT '[]',
    "tipo_marca" VARCHAR(255) DEFAULT 'denominativa',
    "clases" INTEGER[] DEFAULT ARRAY[]::INTEGER[],

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires" TIMESTAMPTZ(6) NOT NULL,
    "session_token" VARCHAR(255) NOT NULL,
    "access_token" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMPTZ(6) NOT NULL
);

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "tier" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255),
    "contact_number" VARCHAR(20),
    "agent_number" VARCHAR(20),
    "province" VARCHAR(50),
    "zip_code" VARCHAR(10),
    "welcome_seen" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marca_user_email_idx" ON "Marca"("user_email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE INDEX "idx_marca_files_marca_id" ON "marca_files"("marca_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_access_token_key" ON "sessions"("access_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_userId_key" ON "UserSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "Marca" ADD CONSTRAINT "Marca_titularId_fkey" FOREIGN KEY ("titularId") REFERENCES "Titular"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marca_files" ADD CONSTRAINT "marca_files_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
