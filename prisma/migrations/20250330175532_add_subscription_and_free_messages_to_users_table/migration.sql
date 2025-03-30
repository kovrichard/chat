-- AlterTable
ALTER TABLE "users" ADD COLUMN     "freeMessages" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "subscription" TEXT NOT NULL DEFAULT 'free';
