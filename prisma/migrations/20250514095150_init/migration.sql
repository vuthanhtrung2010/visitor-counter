-- CreateTable
CREATE TABLE "Counter" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Counter_username_key" ON "Counter"("username");
