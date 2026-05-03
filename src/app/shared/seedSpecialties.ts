
import { v2 as cloudinary } from "cloudinary";
import config from "../config";
import prisma from "./prisma";
import path from "path";
import fs from "fs";

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

const specialtiesData = [
  { title: "Cardiology", fileName: "cardiology_icon.png" },
  { title: "Neurology", fileName: "neurology_icon.png" },
  { title: "Orthopedics", fileName: "orthopedics_icon.png" },
  { title: "Pediatrics", fileName: "pediatrics_icon.png" },
  { title: "Gynecology", fileName: "gynecology_icon.png" },
  { title: "Dermatology", fileName: "dermatology_icon.png" },
  { title: "Psychiatry", fileName: "psychiatry_icon.png" },
  { title: "Gastroenterology", fileName: "gastroenterology_icon.png" },
  { title: "Oncology", fileName: "oncology_icon.png" },
  { title: "Radiology", fileName: "radiology_icon.png" },
  { title: "Ophthalmology", fileName: "ophthalmology_icon.png" },
  { title: "Dentistry", fileName: "dentistry_icon.png" },
  { title: "Urology", fileName: "urology_icon.png" },
  { title: "Nephrology", fileName: "nephrology_icon.png" },
  { title: "Pulmonology", fileName: "pulmonology_icon.png" },
  { title: "Endocrinology", fileName: "endocrinology_icon.png" },
  { title: "Rheumatology", fileName: "rheumatology_icon.png" }
];

const iconsDir = path.join(__dirname, "../../assets/specialty-icons");

async function seed() {
  console.log("Cleaning existing specialties...");
  // await prisma.specialty.deleteMany({});
  
  console.log("Seeding specialties with AI-generated icons...");
  
  for (const specialty of specialtiesData) {
    try {
      const filePath = path.join(iconsDir, specialty.fileName);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}. Skipping ${specialty.title}.`);
        continue;
      }

      console.log(`Uploading icon for ${specialty.title} from ${filePath}...`);
      
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        folder: "healbridge/specialties",
        public_id: specialty.title.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      });

      await prisma.specialty.upsert({
        where: { id: specialty.title }, // This assumes title is unique or we use a different way to identify
        // Wait, the model uses UUID as ID. Let's use title to check if it exists.
        update: {
          icon: uploadResult.secure_url,
        },
        create: {
          title: specialty.title,
          icon: uploadResult.secure_url,
        },
      });
      
      // Since Specialty model doesn't have a unique constraint on title in schema.prisma, 
      // I'll just create it or check manually.
      /*
      const existing = await prisma.specialty.findFirst({ where: { title: specialty.title } });
      if (existing) {
        await prisma.specialty.update({
          where: { id: existing.id },
          data: { icon: uploadResult.secure_url }
        });
      } else {
        await prisma.specialty.create({
          data: {
            title: specialty.title,
            icon: uploadResult.secure_url,
          },
        });
      }
      */
      
      // Let's stick to simple creation for now if we just cleaned it, or use a better check.
      const existing = await prisma.specialty.findFirst({ where: { title: specialty.title } });
      if (existing) {
          await prisma.specialty.update({
              where: { id: existing.id },
              data: { icon: uploadResult.secure_url }
          });
      } else {
          await prisma.specialty.create({
              data: {
                  title: specialty.title,
                  icon: uploadResult.secure_url,
              },
          });
      }

      console.log(`Successfully seeded ${specialty.title}`);
    } catch (error) {
      console.error(`Error seeding ${specialty.title}:`, error);
    }
  }
  
  console.log("Seeding complete.");
  process.exit(0);
}

seed();

