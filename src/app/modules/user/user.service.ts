
import { Admin, Doctor, Patient, UserRole, UserStatus } from '@prisma/client';
import { TImageFile } from '../../interface/image.interface';
import { hashPassword } from '../../shared/bcryptHelper';
import config from '../../config';
import prisma, { TransactionClient } from '../../shared/prisma';
import { JwtPayload } from 'jsonwebtoken';
import { QueryBuilder } from '../../builder/queryBuilder';
import { IQueryParams } from '../../interface/query.interface';
import { userSearchableFields } from './user.interface';


const createAdminIntoDB = async (image: TImageFile, password: string, payload: Admin): Promise<Admin> => {
    if (image && image.path) {
        payload.avatar = image.path;
    }

    const hashedPassword = await hashPassword(password, Number(config.bcrypt_salt_rounds))
    
    const userData = {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        role: UserRole.ADMIN
    }

    const result = await prisma.$transaction(
        async (tx: TransactionClient) => {
            await tx.user.create({
                data: userData
            });
            const createAdmin = await tx.admin.create({
                data: payload
            });

            return createAdmin
        }
    )
    return result;
}

const createDoctorIntoDB = async (image: TImageFile, password: string, payload: Doctor): Promise<Doctor> => {
    if (image && image.path) {
        payload.avatar = image.path;
    }

    const hashedPassword = await hashPassword(password, Number(config.bcrypt_salt_rounds))
    
    const userData = {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        role: UserRole.DOCTOR
    }

    const result = await prisma.$transaction(
        async (tx: TransactionClient) => {
            await tx.user.create({
                data: userData
            });
            const createDoctor = await tx.doctor.create({
                data: payload
            });

            return createDoctor
        }
    )
    return result;
}

const createPatientIntoDB = async (image: TImageFile, password: string, payload: Patient): Promise<Patient> => {
    if (image && image.path) {
        payload.avatar = image.path;
    }

    const hashedPassword = await hashPassword(password, Number(config.bcrypt_salt_rounds))
    
    const userData = {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        role: UserRole.PATIENT
    }

    const result = await prisma.$transaction(
        async (tx: TransactionClient) => {
            await tx.user.create({
                data: userData
            });
            const createPatient = await tx.patient.create({
                data: payload
            });

            return createPatient
        }
    )
    return result;
}

const getMyProfileFromDB = async (userData: JwtPayload) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: userData.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      needPasswordChange: true,
      role: true,
      status: true,
    },
  });

  let profileInfo;

  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  }

  return { ...userInfo, ...profileInfo };
};

const updateMyProfileIntoDB = async (
  userData: JwtPayload,
  image: TImageFile,
  payload: Partial<Admin | Doctor | Patient>
) => {
  const isUser = await prisma.user.findUniqueOrThrow({
    where: {
      email: userData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const file = image;
  if (file) {
    payload.avatar = file.path;
  }

  let profileInfo;

  if (isUser.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: isUser.email,
      },
      data: payload,
    });
  } else if (isUser.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: isUser.email,
      },
      data: payload,
    });
  } else if (isUser.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.update({
      where: {
        email: isUser.email,
      },
      data: payload,
    });
  } else if (isUser.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.update({
      where: {
        email: isUser.email,
      },
      data: payload,
    });
  }

  return { ...profileInfo };
};

const changeProfileStatusFromDB = async (id: string, status: UserRole) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const updateStatus = await prisma.user.update({
    where: {
      id: user?.id,
    },
    data: status,
  });

  return updateStatus;
};


const getAllUsersFromDB = async (query:IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.user, query)
    .search(userSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields()
    .select({
      id: true,
      email: true,
      name: true,
      role: true,
      needPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: true,
      doctor: true,
      patient: true,
    });

  const users = await queryBuilder.execute();
  const meta = await queryBuilder.countTotal();

  return { meta, data: users };
};

const getSingleUserFromDB = async (email: string) => {
  const isUser = await prisma.user.findUniqueOrThrow({
    where: {
      email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      needPasswordChange: true,
      role: true,
      status: true,
    },
  });

  let profileInfo;

  if (isUser.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: isUser.email,
      },
    });
  } else if (isUser.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: isUser.email,
      },
    });
  } else if (isUser.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.findUnique({
      where: {
        email: isUser.email,
      },
    });
  } else if (isUser.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.findUnique({
      where: {
        email: isUser.email,
      },
    });
  }

  return { ...isUser, ...profileInfo };
};


export const UserServices = {
    createAdminIntoDB,
    createDoctorIntoDB,
    createPatientIntoDB,
    getAllUsersFromDB,
    getSingleUserFromDB,
    getMyProfileFromDB,
    updateMyProfileIntoDB,
    changeProfileStatusFromDB
}