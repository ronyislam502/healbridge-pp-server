export const doctorSearchableFields = [
  "name",
  "email",
  "phone",
  "qualification",
  "designation",
  "specialties",
];

export type TDoctorUpdate = {
  name: string;
  avatar: string;
  contactNumber: string;
  address: string;
  registrationNumber: string;
  experience: number;
  gender: "MALE" | "FEMALE";
  appointmentFee: number;
  qualification: string;
  currentWorkingPlace: string;
  designation: string;
  specialties: ISpecialties[];
};

export type ISpecialties = {
  specialtiesId: string;
  isDeleted?: null;
};
