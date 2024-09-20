import { z } from "zod";
import { DEFAULT_PET_IMAGE } from "./constants";

export const petIdSchema = z.string().cuid("Invalid pet ID");

export const petFormSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Name is required" }).max(100),
    ownerName: z
      .string()
      .trim()
      .min(1, { message: "Owner name is required" })
      .max(100),
    imageUrl: z.union([
      z.literal(""),
      z.string().trim().url({ message: "Please enter a valid image URL" }),
    ]),
    age: z.coerce
      .number()
      .int()
      .positive()
      .min(1, { message: "Age is required" })
      .max(100),
    notes: z.union([z.literal(""), z.string().trim().max(1000)]),
  })
  .transform((data) => ({
    ...data,
    imageUrl: data.imageUrl || DEFAULT_PET_IMAGE,
  }));

export const credentialsSchema = z.object({
  email: z.string().trim().email().max(100),
  password: z.string().trim().min(8).max(100),
});

export type TPetFormValues = z.infer<typeof petFormSchema>;
export type TCredentials = z.infer<typeof credentialsSchema>;
