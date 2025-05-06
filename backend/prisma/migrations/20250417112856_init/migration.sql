/*
  Warnings:

  - The values [ISO_SERVICE] on the enum `ServiceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ServiceType_new" AS ENUM ('ISO_27001_INFORMATION_SECURITY_MANAGEMENT_SYSTEM', 'ISO_27701_PRIVACY_INFORMATION_MANAGEMENT_SYSTEM', 'ISO_22301_BUSINESS_CONTINUITY_MANAGEMENT_SYSTEM', 'ISO_27017_CLOUD_SECURITY_CONTROLS', 'ISO_27018_PII_PROTECTION_IN_PUBLIC_CLOUD', 'ISO_20000_SERVICE_MANAGEMENT', 'ISO_12207_SOFTWARE_LIFE_CYCLE', 'ISO_42001_AI_MANAGEMENT_SYSTEM', 'TESTING_SERVICES', 'RISK_ASSESSMENT', 'BUSINESS_IMPACT_ANALYSIS', 'PRIVACY_IMPACT_ANALYSIS', 'DATA_ASSURANCE', 'AUDIT', 'AWARENESS_TRAINING', 'TABLETOP_EXERCISE', 'OTHER');
ALTER TABLE "ClientProfile" ALTER COLUMN "requestedServices" DROP DEFAULT;
ALTER TABLE "ConsultantProfile" ALTER COLUMN "servicesOffered" DROP DEFAULT;
ALTER TABLE "ClientProfile" ALTER COLUMN "requestedServices" TYPE "ServiceType_new"[] USING ("requestedServices"::text::"ServiceType_new"[]);
ALTER TABLE "ConsultantProfile" ALTER COLUMN "servicesOffered" TYPE "ServiceType_new"[] USING ("servicesOffered"::text::"ServiceType_new"[]);
ALTER TYPE "ServiceType" RENAME TO "ServiceType_old";
ALTER TYPE "ServiceType_new" RENAME TO "ServiceType";
DROP TYPE "ServiceType_old";
ALTER TABLE "ClientProfile" ALTER COLUMN "requestedServices" SET DEFAULT ARRAY[]::"ServiceType"[];
ALTER TABLE "ConsultantProfile" ALTER COLUMN "servicesOffered" SET DEFAULT ARRAY[]::"ServiceType"[];
COMMIT;
