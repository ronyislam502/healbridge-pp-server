// export const userSearchableFields = [
//   { field: "role", isEnum: true },
//   { field: "email", isEnum: false },
//   { field: "status", isEnum: true },
//   { field: "name", isEnum: false },
//   { field: "admin.name", isEnum: false }, // nested
//   { field: "doctor.name", isEnum: false }, // nested
//   { field: "patient.name", isEnum: false }, // nested
// ];

export const userSearchableFields = [
  "email",
  "doctor.name",
  "patient.name",
  "admin.name",
  "doctor.phone",
  "patient.phone",
  "admin.phone",
];
