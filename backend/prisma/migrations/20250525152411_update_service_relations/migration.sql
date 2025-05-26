/*
  Warnings:

  - You are about to drop the column `requestedServices` on the `ClientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `servicesOffered` on the `ConsultantProfile` table. All the data in the column will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `projectId` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ConsultantStatus" AS ENUM ('PENDING_REVIEW', 'INTERVIEW_INVITED', 'INTERVIEW_SCHEDULED', 'REJECTED', 'APPROVED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OnboardingStatus" ADD VALUE 'PENDING_DISCOVERY';
ALTER TYPE "OnboardingStatus" ADD VALUE 'DISCOVERY_INVITED';
ALTER TYPE "OnboardingStatus" ADD VALUE 'DISCOVERY_SCHEDULED';
ALTER TYPE "OnboardingStatus" ADD VALUE 'DISCOVERY_COMPLETED';
ALTER TYPE "OnboardingStatus" ADD VALUE 'SCOPING_IN_PROGRESS';
ALTER TYPE "OnboardingStatus" ADD VALUE 'SCOPING_REVIEW';
ALTER TYPE "OnboardingStatus" ADD VALUE 'NDA_PENDING';
ALTER TYPE "OnboardingStatus" ADD VALUE 'TERMS_PENDING';
ALTER TYPE "OnboardingStatus" ADD VALUE 'ONBOARDED';
ALTER TYPE "OnboardingStatus" ADD VALUE 'REJECTED';

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_consultantId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_uploadedById_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_projectId_fkey";

-- AlterTable
ALTER TABLE "ClientProfile" DROP COLUMN "requestedServices",
ADD COLUMN     "adminReviewNotes" TEXT,
ADD COLUMN     "discoveryCallDate" TIMESTAMP(3),
ADD COLUMN     "discoveryCallLink" TEXT,
ADD COLUMN     "discoveryCallStatus" TEXT DEFAULT 'not_started',
ADD COLUMN     "isDiscoveryCallInvited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ndaPdfUrl" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ALTER COLUMN "onboardingStatus" SET DEFAULT 'PENDING_DISCOVERY';

-- AlterTable
ALTER TABLE "ConsultantProfile" DROP COLUMN "servicesOffered",
ADD COLUMN     "interviewDate" TIMESTAMP(3),
ADD COLUMN     "interviewScore" DOUBLE PRECISION,
ADD COLUMN     "isAllowedToLogin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reviewNotes" TEXT,
ADD COLUMN     "status" "ConsultantStatus" NOT NULL DEFAULT 'PENDING_REVIEW';

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "projectId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Phase" ALTER COLUMN "projectId" DROP NOT NULL;

-- DropTable
DROP TABLE "Document";

-- DropEnum
DROP TYPE "ServiceType";

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "documentType" TEXT NOT NULL DEFAULT 'PROPOSAL',
    "serviceId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "clientId" TEXT,
    "consultantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScopingForm" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT,
    "questions" JSONB NOT NULL,
    "answers" JSONB,
    "clientId" TEXT,
    "createdById" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScopingForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceProposal" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "phases" JSONB NOT NULL,
    "timeline" JSONB NOT NULL,
    "deliverables" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ClientProfileToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ConsultantProfileToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ScopingForm_clientId_serviceId_key" ON "ScopingForm"("clientId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "_ClientProfileToService_AB_unique" ON "_ClientProfileToService"("A", "B");

-- CreateIndex
CREATE INDEX "_ClientProfileToService_B_index" ON "_ClientProfileToService"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ConsultantProfileToService_AB_unique" ON "_ConsultantProfileToService"("A", "B");

-- CreateIndex
CREATE INDEX "_ConsultantProfileToService_B_index" ON "_ConsultantProfileToService"("B");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScopingForm" ADD CONSTRAINT "ScopingForm_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScopingForm" ADD CONSTRAINT "ScopingForm_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScopingForm" ADD CONSTRAINT "ScopingForm_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProposal" ADD CONSTRAINT "ServiceProposal_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientProfileToService" ADD CONSTRAINT "_ClientProfileToService_A_fkey" FOREIGN KEY ("A") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientProfileToService" ADD CONSTRAINT "_ClientProfileToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConsultantProfileToService" ADD CONSTRAINT "_ConsultantProfileToService_A_fkey" FOREIGN KEY ("A") REFERENCES "ConsultantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConsultantProfileToService" ADD CONSTRAINT "_ConsultantProfileToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
