/*
  Warnings:

  - You are about to drop the column `dataOfBirth` on the `patient_health_datas` table. All the data in the column will be lost.
  - Added the required column `dateOfBirth` to the `patient_health_datas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "patient_health_datas" DROP COLUMN "dataOfBirth",
ADD COLUMN     "dateOfBirth" TEXT NOT NULL;
