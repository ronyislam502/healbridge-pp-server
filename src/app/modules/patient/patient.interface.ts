import { BloodGroup, MaritalStatus } from "@prisma/client";

export const patientSearchableFields = ["name", "email", "phone"];

type TPatientHealthData = {
  dateOfBirth: string;
  bloodGroup: BloodGroup;
  hasAllergies?: boolean;
  hasDiabetes?: boolean;
  height: string;
  weight: string;
  smokingStatus?: boolean;
  dietaryPreferences?: string;
  pregnancyStatus?: boolean;
  mentalHealthHistory?: string;
  immunizationStatus?: string;
  hasPastSurgeries?: boolean;
  recentAnxiety?: boolean;
  recentDepression?: boolean;
  maritalStatus?: MaritalStatus;
};

type TMedicalReport = {
  reportName: string;
  reportLink: string;
};

export type IPatientUpdate = {
  name: string;
  contactNumber: string;
  address: string;
  patientHealthData: TPatientHealthData;
  medicalReport: TMedicalReport;
};
