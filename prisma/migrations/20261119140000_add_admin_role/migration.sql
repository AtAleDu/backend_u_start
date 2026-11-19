-- AlterEnum: add ADMIN to UserRole
CREATE TYPE "UserRole_new" AS ENUM ('STUDENT', 'COMPANY', 'ADMIN');

ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "UserRole_new"
  USING ("role"::text::"UserRole_new");

ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
