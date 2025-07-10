-- CreateTable
CREATE TABLE "Lead" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(50) NOT NULL,
    "direccion" VARCHAR(255),
    "website" VARCHAR(255),
    "socialMedia" VARCHAR(255),
    "whatsapp" VARCHAR(20),
    "email" VARCHAR(255),
    "contacted" BOOLEAN NOT NULL DEFAULT false,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'nuevo',
    "meetingSet" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_user_id_idx" ON "Lead"("userId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION; 