import { Pet } from "@prisma/client";

export type PetFormValues = Omit<
  Pet,
  "id" | "createdAt" | "updatedAt" | "userId"
>;
