import { Doctor, UserStatus } from "@prisma/client";
import { QueryBuilder } from "../../builder/queryBuilder";
import { IQueryParams } from "../../interface/query.interface";
import prisma from "../../shared/prisma"
import { TMeta } from "../../shared/sendResponse";
import { TImageFile } from "../../interface/image.interface";
import { doctorFilterableFields, doctorSearchableFields, ISpecialties } from "./doctor.interface";
import AppError from "../../errors/AppError";
import httpStatus  from 'http-status';
import { extractDoctorFromMessage, openai } from "../../shared/openai";


const aiDoctorSuggestionFromDB = async (payload: { symptoms: string }) => {
  if (!(payload && payload.symptoms)) {
   throw new AppError(httpStatus.BAD_REQUEST, "Symptoms are required")
  }
  
  const doctors = await prisma.doctor.findMany({
    where: { isDeleted: false },
    include: {
      doctorSpecialties: {
        include: {
          specialties:true
        }
      }
    }
  })

  
  const prompt = `
You are a professional AI medical assistant.

User Symptoms:
${payload.symptoms}

Available Doctors and doctor list (full details):
${JSON.stringify(doctors, null, 2)}

Instructions:
1. Based on the user's symptoms, determine the most relevant doctor specialty.
2. Suggest the best matching doctor(s) from the list above.
3. Return your response strictly in JSON format with this structure:

{
  "suggestedSpecialty": "Name of the specialty",
  "suggestedDoctors": [
    {
      "id": "...",
      "name": "...",
      "email": "...",
      "phone": "...",
      "avatar": "...",
      "registrationNumber": "...",
      "experience": ...,
      "gender": "...",
      "appointmentFee": ...,
      "qualification": "...",
      "currentWorkingPlace": "...",
      "designation": "...",
      "doctorSpecialties": [ ... ]
    }
  ]
}

Notes:
- Return only valid JSON. Do not include any explanation or extra text.
- The doctors in the suggestedDoctors array must be from the provided list.
`;

  const completion = await openai.chat.completions.create({
    model: 'tencent/hy3-preview:free',
    messages: [
    {
        role: "system",
        content: `AI medical assistant.
        `,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });
  // console.log(completion.choices[0].message);

  const result = await extractDoctorFromMessage(completion.choices[0].message);

  return result;
  
}

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
  aiDoctorSuggestionFromDB
};
