import { Specialty } from "@prisma/client";
import prisma from "../../shared/prisma";

const createSpecialtiesIntoDB = async (payload: Specialty) => {
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
