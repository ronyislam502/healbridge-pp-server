import { Specialty } from "@prisma/client";
import prisma from "../../shared/prisma";
import { TImageFile } from "../../interface/image.interface";

const createSpecialtiesIntoDB = async (icon: TImageFile, payload: Specialty) => {
  
   if (icon && icon.path) {
        payload.icon = icon.path;
    }

  const result = await prisma.specialty.create({
    data: payload,
  });

  return result;
};

const getAllSpecialtiesFromDB = async () => {
  const result = await prisma.specialty.findMany();

  return result;
};

const deleteSpecialtiesFromDB = async (id: string) => {
  const result = await prisma.specialty.delete({
    where: {
      id,
    },
  });

  return result;
};

export const SpecialtiesServices = {
  createSpecialtiesIntoDB,
  getAllSpecialtiesFromDB,
  deleteSpecialtiesFromDB,
};
