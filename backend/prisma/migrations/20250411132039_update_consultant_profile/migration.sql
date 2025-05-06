/*
  Warnings:

  - You are about to drop the column `audit` on the `ClientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `awarenessTraining` on the `ClientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `businessImpactAnalysis` on the `ClientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `dataAssurance` on the `ClientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `isoService` on the `ClientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `other` on the `ClientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `privacyImpactAnalysis` on the `ClientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `riskAssessment` on the `ClientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `tabletopExercise` on the `ClientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `testingServices` on the `ClientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `contactInfo` on the `ConsultantProfile` table. All the data in the column will be lost.
  - You are about to drop the column `contactName` on the `ConsultantProfile` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `ConsultantProfile` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `ConsultantProfile` table. All the data in the column will be lost.
  - Added the required column `contactFirstName` to the `ConsultantProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactLastName` to the `ConsultantProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `ConsultantProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `ConsultantProfile` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `dateOfBirth` on the `ConsultantProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('ISO_SERVICE', 'TESTING_SERVICES', 'RISK_ASSESSMENT', 'BUSINESS_IMPACT_ANALYSIS', 'PRIVACY_IMPACT_ANALYSIS', 'DATA_ASSURANCE', 'AUDIT', 'AWARENESS_TRAINING', 'TABLETOP_EXERCISE', 'OTHER');

-- AlterTable
ALTER TABLE "ClientProfile" DROP COLUMN "audit",
DROP COLUMN "awarenessTraining",
DROP COLUMN "businessImpactAnalysis",
DROP COLUMN "dataAssurance",
DROP COLUMN "isoService",
DROP COLUMN "other",
DROP COLUMN "privacyImpactAnalysis",
DROP COLUMN "riskAssessment",
DROP COLUMN "tabletopExercise",
DROP COLUMN "testingServices",
ADD COLUMN     "requestedServices" "ServiceType"[] DEFAULT ARRAY[]::"ServiceType"[];

-- AlterTable
ALTER TABLE "ConsultantProfile" DROP COLUMN "contactInfo",
DROP COLUMN "contactName",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "contactFirstName" TEXT NOT NULL,
ADD COLUMN     "contactLastName" TEXT NOT NULL,
ADD COLUMN     "cvUrl" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "otherDetails" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "servicesOffered" "ServiceType"[] DEFAULT ARRAY[]::"ServiceType"[],
DROP COLUMN "dateOfBirth",
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL;
