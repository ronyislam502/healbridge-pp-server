
import { Admin, UserRole } from '@prisma/client';
import { TImageFile } from '../../interface/image.interface';
import { hashPassword } from '../../shared/bcryptHelper';
import config from '../../config';
import prisma, { TransactionClient } from '../../shared/prisma';


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


export const UserServices = {
    createAdminIntoDB
}