
import { Admin, Doctor, Patient, UserRole } from '@prisma/client';
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


export const UserServices = {
    createAdminIntoDB,
    createDoctorIntoDB,
    createPatientIntoDB
}