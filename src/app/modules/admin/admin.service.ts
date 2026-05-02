import { Admin } from "@prisma/client";
import { QueryBuilder } from "../../builder/queryBuilder";
import { IQueryParams } from "../../interface/query.interface";
import prisma from "../../shared/prisma"
import { TMeta } from "../../shared/sendResponse";
import { TImageFile } from "../../interface/image.interface";

const allAdminsFromDB = async (
  query: IQueryParams
): Promise<{ data: Admin[], meta: TMeta }> => {
    const adminBuilder = new QueryBuilder<Admin>(prisma.admin, query)
        .search([])
        .filter()
        .sort()
        .paginate()
        .fields();
    
    const data = await adminBuilder.execute();
    const meta = await adminBuilder.countTotal();

    return {data, meta}

};


const singleAdminFromDB = async (id: string): Promise<Admin | null> => {
  const result = await prisma.admin.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });
  return result;
};


const updateAdminIntoDB = async (
  id: string,
  image: TImageFile,
  payload: Partial<Admin>
): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const file = image;
  if (file) {
    payload.avatar = file.path;
  }

  const updatedAdmin = await prisma.admin.update({
    where: {
      id,
    },
    data: payload,
  });

  return updatedAdmin;
};


export const AdminServices = {
    allAdminsFromDB,
    singleAdminFromDB,
    updateAdminIntoDB
}