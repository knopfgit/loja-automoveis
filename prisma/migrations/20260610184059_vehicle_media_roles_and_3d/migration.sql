-- CreateEnum
CREATE TYPE "MediaRole" AS ENUM ('GALLERY', 'SPIN_360', 'INTERIOR', 'VIDEO');

-- AlterTable
ALTER TABLE "vehicle_media" ADD COLUMN     "height" INTEGER,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "placeholder" TEXT,
ADD COLUMN     "role" "MediaRole" NOT NULL DEFAULT 'GALLERY',
ADD COLUMN     "sizeBytes" INTEGER,
ADD COLUMN     "width" INTEGER;

-- AlterTable
ALTER TABLE "vehicle_specs" ADD COLUMN     "model3dUrl" TEXT;

-- CreateIndex
CREATE INDEX "vehicle_media_vehicleId_role_position_idx" ON "vehicle_media"("vehicleId", "role", "position");

-- backfill: vídeos existentes recebem o role correto
UPDATE "vehicle_media" SET "role" = 'VIDEO' WHERE "type" = 'video';