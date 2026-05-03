import { Patient, UserStatus } from "@prisma/client";
import prisma from "../../shared/prisma";
import { TMeta } from "../../shared/sendResponse";
import { IPatientUpdate, patientSearchableFields } from "./patient.interface";
import { QueryBuilder } from "../../builder/queryBuilder";
import { IQueryParams } from "../../interface/query.interface";


const allPatientsFromDB = async (
  query: IQueryParams
): Promise<{ meta: TMeta; data: Patient[] }> => {
  const patientQuery = new QueryBuilder(prisma.patient, query)
    .search(patientSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const meta = await patientQuery.countTotal();
  const data = await patientQuery.execute();

  return { meta, data };
};

const singlePatientFromDB = async (id: string) => {
  const result = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      patientHealthData: true,
      medicalReport: true,
    },
  });

  return result;
};

const deletePatientFromDB = async (id: string): Promise<Patient | null> => {
  await prisma.patient.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const patientDelete = await transactionClient.patient.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    await transactionClient.user.update({
      where: {
        email: patientDelete?.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return patientDelete;
  });

  return result;
};

const updatePatientIntoDB = async (
  id: string,
  payload: Partial<IPatientUpdate>
): Promise<Patient | null> => {
  const { patientHealthData, medicalReport, ...patientData } = payload;

  const isPatient = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.patient.update({
      where: {
        id: isPatient.id,
      },
      data: patientData,
      include: {
        patientHealthData: true,
        medicalReport: true,
      },
    });

    if (patientHealthData) {
      await transactionClient.patientHealthData.upsert({
        where: {
          patientId: isPatient.id,
        },
        update: patientHealthData,
        create: { ...patientHealthData, patientId: isPatient.id },
      });
    }

    if (medicalReport) {
      await transactionClient.medicalReport.create({
        data: { ...medicalReport, patientId: isPatient.id },
      });
    }
  });

  // console.log("phd", patientHealthData, medicalReport);

  const result = await prisma.patient.findUnique({
    where: {
      id: isPatient.id,
    },
    include: {
      patientHealthData: true,
      medicalReport: true,
    },
  });

  return result;
};

export const PatientServices = {
  allPatientsFromDB,
  singlePatientFromDB,
  deletePatientFromDB,
  updatePatientIntoDB,
};
