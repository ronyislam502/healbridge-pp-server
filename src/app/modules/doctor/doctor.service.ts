import { Doctor } from "@prisma/client";
import { QueryBuilder } from "../../builder/queryBuilder";
import { IQueryParams } from "../../interface/query.interface";
import prisma from "../../shared/prisma"
import { TMeta } from "../../shared/sendResponse";
import { TImageFile } from "../../interface/image.interface";
import { doctorSearchableFields } from "./doctor.interface";

const allDoctorsFromDB = async (
  query: IQueryParams
): Promise<{ data: Doctor[], meta: TMeta }> => {
    const doctorBuilder = new QueryBuilder<Doctor>(prisma.doctor, query)
        .search(doctorSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    
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
  await prisma.doctor.findUniqueOrThrow({
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
      id,
    },
    data: payload,
  });

  return updatedDoctor;
};


export const DoctorServices = {
    allDoctorsFromDB,
    singleDoctorFromDB,
    updateDoctorIntoDB
}