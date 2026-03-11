import prisma from "../../shared/prisma";
import { adminSearchableFields } from "./admin.interface";
import { TMeta } from "../../shared/sendResponse";
import { Admin, UserStatus } from "@prisma/client";
import { TImageFile } from "../../interface/image.interface";
import HealthQueryBuilder from "../../builder/healthQuery";

const getAllAdminsFromDB = async (
  query: Record<string, unknown>
): Promise<{ meta: TMeta; data: Admin[] }> => {
  const queryBuilder = new HealthQueryBuilder(prisma.admin, query)
    .search(adminSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const admins = await queryBuilder.execute();
  const meta = await queryBuilder.countTotal();

  return { meta, data: admins };
};

const getSingleAdminFromDB = async (id: string): Promise<Admin | null> => {
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

// permanent delete or vanish data

// const deleteAdminFromDB = async (id: string): Promise<Admin | null> => {
//   await prisma.admin.findUniqueOrThrow({
//     where: {
//       id,
//     },
//   });

//   const result = await prisma.$transaction(async (transactionClient) => {
//     const adminDelete = await transactionClient.admin.delete({
//       where: {
//         id,
//       },
//     });

//     await transactionClient.user.delete({
//       where: {
//         email: adminDelete?.email,
//       },
//     });

//     return adminDelete;
//   });

//   return result;
// };

const deleteAdminFromDB = async (id: string): Promise<Admin | null> => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const adminDelete = await transactionClient.admin.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    await transactionClient.user.update({
      where: {
        email: adminDelete?.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return adminDelete;
  });

  return result;
};

export const AdminServices = {
  getAllAdminsFromDB,
  getSingleAdminFromDB,
  updateAdminIntoDB,
  deleteAdminFromDB,
};
