-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "telegramId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "languageCode" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_telegramId_key" ON "user"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");
