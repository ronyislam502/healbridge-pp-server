import { Doctor, UserStatus } from "@prisma/client";
import { QueryBuilder } from "../../builder/queryBuilder";
import { IQueryParams } from "../../interface/query.interface";
import prisma, { TransactionClient } from "../../shared/prisma"
import { TMeta } from "../../shared/sendResponse";
import { TImageFile } from "../../interface/image.interface";
import { doctorSearchableFields, ISpecialties, TDoctorUpdate } from "./doctor.interface";

const allDoctorsFromDB = async (
  query: IQueryParams
): Promise<{ data: Doctor[], meta: TMeta }> => {
    const doctorBuilder = new QueryBuilder<Doctor>(prisma.doctor, query)
        .search(doctorSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields()
        .include({
            doctorSpecialties: {
                include: {
                    specialties: true
                }
            },
            doctorSchedules: {
                include: {
                    schedule: true
                }
            }
        });
    
    const data = await doctorBuilder.execute();
    const meta = await doctorBuilder.countTotal();

    return {data, meta}

};


const singleDoctorFromDB = async (id: string): Promise<Doctor | null> => {
  const result = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });
  return result;
};


const updateDoctorIntoDB = async (
  id: string,
  image: TImageFile,
  payload: Partial<Doctor>
): Promise<Doctor | null> => {
 const isDoctor= await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const file = image;
  if (file) {
    payload.avatar = file.path;
  }

  const updatedDoctor = await prisma.doctor.update({
    where: {
      id: isDoctor.id,
    },
    data: payload,
  });

  return updatedDoctor;
};


const deleteDoctorFromDB = async (id: string): Promise<Doctor | null> => {
  await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const doctorDelete = await transactionClient.doctor.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    await transactionClient.user.update({
      where: {
        email: doctorDelete?.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return doctorDelete;
  });

  return result;
};


const updateDoctorSpecialtiesIntoDB = async (
  id: string,
  payload: ISpecialties[]
) => {
  const isDoctor = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  await prisma.$transaction(async (transactionClient) => {
    if (payload && payload.length > 0) {
      // delete specialties
      const deleteDoctorSpecialties = payload.filter(
        (specialty) => specialty.isDeleted
      );
      for (const specialty of deleteDoctorSpecialties) {
        await transactionClient.doctorSpecialties.deleteMany({
          where: {
            doctorId: isDoctor.id,
            specialtiesId: specialty.specialtiesId,
          },
        });
      }

      // create specialties
      const createDoctorSpecialties = payload.filter(
        (specialty) => !specialty.isDeleted
      );
      for (const specialty of createDoctorSpecialties) {
        await transactionClient.doctorSpecialties.create({
          data: {
            doctorId: isDoctor.id,
            specialtiesId: specialty.specialtiesId,
          },
        });
      }
    }
  });

  const result = await prisma.doctor.findUnique({
    where: {
      id: isDoctor.id,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
    },
  });

  return result;
};

export const DoctorServices = {
  allDoctorsFromDB,
  singleDoctorFromDB,
  updateDoctorIntoDB,
  deleteDoctorFromDB,
  updateDoctorSpecialtiesIntoDB,
};
