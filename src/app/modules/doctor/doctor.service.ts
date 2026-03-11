import { Doctor, UserStatus } from "@prisma/client";
import prisma from "../../shared/prisma";
import { TMeta } from "../../shared/sendResponse";
import { doctorSearchableFields, TDoctorUpdate } from "./doctor.interface";
import HealthQueryBuilder from "../../builder/healthQuery";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { extractDoctorFromMessage, openai } from "../../shared/openai";

const getAllDoctorsFromDB = async (
  query: Record<string, unknown>
): Promise<{ meta: TMeta; data: Doctor[] }> => {
  const doctorQuery = new HealthQueryBuilder(prisma.doctor, query)
    .search(doctorSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields()
    .setInclude({
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
    });

  const meta = await doctorQuery.countTotal();
  const data = await doctorQuery.execute();

  return { meta, data };
};

const getSingleDoctorFromDB = async (id: string): Promise<Doctor> => {
  const result = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
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

const updateDoctorFromDB = async (
  id: string,
  payload: Partial<TDoctorUpdate>
) => {
  // console.log("uu", payload);
  const { specialties, ...doctorData } = payload;
  const isDoctor = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  await prisma.$transaction(async (transactionClient) => {
    await prisma.doctor.update({
      where: {
        id,
      },
      data: doctorData,
      include: {
        doctorSpecialties: true,
      },
    });

    if (specialties && specialties.length > 0) {
      // delete specialties
      const deleteDoctorSpecialties = specialties.filter(
        (specialty) => specialty.isDeleted
      );
      // console.log("dele", deleteSpecialtiesIds);
      for (const specialty of deleteDoctorSpecialties) {
        await transactionClient.doctorSpecialties.deleteMany({
          where: {
            doctorId: isDoctor?.id,
            specialtiesId: specialty.specialtiesId,
          },
        });
      }

      // create specialties
      const createDoctorSpecialties = specialties.filter(
        (specialty) => !specialty.isDeleted
      );

      // console.log("cre", createDoctorSpecialties);

      for (const specialty of createDoctorSpecialties) {
        await transactionClient.doctorSpecialties.create({
          data: {
            doctorId: isDoctor?.id,
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

const aiDoctorSuggestionFromDB = async (payload: { symptoms: string }) => {
  console.log("payload", payload)
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

  console.log("doctors", doctors)

//    const prompt = `
//       User Symptoms:
//           ${payload.symptoms}

//      Available Doctors:
//      ${JSON.stringify(doctors, null, 2)}

// Based on symptoms, suggest the best doctor specialty and doctor name.
// Return your response in JSON format with full individual doctor data.
  // `;
  
  const prompt = `
You are a professional AI medical assistant.

User Symptoms:
${payload.symptoms}

Available Doctors (full details):
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
      "address": "...",
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
    model: 'arcee-ai/trinity-large-preview:free',
    messages: [
    {
        role: "system",
        content: `
You are a professional AI medical assistant.
        `,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });
  console.log(completion.choices[0].message);

  const result = await extractDoctorFromMessage(completion.choices[0].message);
  console.log("result", result)

  return result
  
}

export const DoctorServices = {
  getAllDoctorsFromDB,
  getSingleDoctorFromDB,
  deleteDoctorFromDB,
  updateDoctorFromDB,
  aiDoctorSuggestionFromDB
};
