import config from "../../../config";
import prisma, { TransactionClient } from "../../shared/prisma"
import { Admin, UserRole } from '@prisma/client';


const createAdminIntoDB = async (payload: Admin) => {}