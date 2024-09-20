"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  credentialsSchema,
  petFormSchema,
  petIdSchema,
} from "@/lib/validations";
import { auth, signIn, signOut } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";

// Pet Actions ----------------------------------------------------------------

export async function addPet(petFormValues: unknown) {
  // Verify that the user has an active session
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Verify that the data matches the Zod schema
  const parsed = petFormSchema.safeParse(petFormValues);
  if (!parsed.success) {
    return {
      message: "Invalid data was provided. Please try again.",
    };
  }

  // Attempt to create the pet in the database
  try {
    await prisma.pet.create({
      data: {
        ...parsed.data,
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });
  } catch (error) {
    console.log(error);
    return {
      message: "Something went wrong. Please try again.",
    };
  }

  // Refresh the UI to show the new data
  revalidatePath("/app", "layout");
}

export async function editPet(petId: unknown, petFormValues: unknown) {
  // Verify that the user has an active session
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Verify that the data matches the Zod schema
  const parsedId = petIdSchema.safeParse(petId);
  const parsedFormValues = petFormSchema.safeParse(petFormValues);
  if (!parsedId.success || !parsedFormValues.success) {
    return {
      message: "Invalid data was provided. Please try again.",
    };
  }

  // Verify that the user owns the pet
  const authorized = await prisma.pet.findUnique({
    select: {
      userId: true,
    },
    where: {
      id: parsedId.data,
    },
  });
  if (!authorized) {
    return {
      message: "Pet not found.",
    };
  }
  if (authorized.userId !== session.user.id) {
    return {
      message: "You don't have permission to update this pet.",
    };
  }

  // Attempt to update the pet in the database
  try {
    await prisma.pet.update({
      where: {
        id: parsedId.data,
      },
      data: parsedFormValues.data,
    });
  } catch (error) {
    console.log(error);
    return {
      message: "Something went wrong. Please try again.",
    };
  }

  // Refresh the UI to show the new data
  revalidatePath("/app", "layout");
}

export async function deletePet(petId: unknown) {
  // Verify that the user has an active session
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Verify that the data matches the Zod schema
  const parsedId = petIdSchema.safeParse(petId);
  if (!parsedId.success) {
    return {
      message: "Invalid data was provided. Please try again.",
    };
  }

  // Verify that the user owns the pet
  const authorized = await prisma.pet.findUnique({
    select: {
      userId: true,
    },
    where: {
      id: parsedId.data,
    },
  });
  if (!authorized) {
    return {
      message: "Pet not found.",
    };
  }
  if (authorized.userId !== session.user.id) {
    return {
      message: "You don't have permission to delete this pet.",
    };
  }

  // Attempt to delete the pet in the database
  try {
    await prisma.pet.delete({
      where: {
        id: parsedId.data,
      },
    });
  } catch (error) {
    console.log(error);
    return {
      message: "Something went wrong. Please try again.",
    };
  }

  // Refresh the UI to show the new data
  revalidatePath("/app", "layout");
}

// Registration ---------------------------------------------------------------

export async function signUp(_prevState: unknown, formData: unknown) {
  // Narrow type to verify we're working with FormData
  if (!(formData instanceof FormData)) {
    return {
      message: "Invalid data was provided. Please try again.",
    };
  }

  // Verify that the data matches the Zod schema
  const validated = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    console.log("Couldn't validate credentials", validated.error);
    return;
  }

  const { email, password } = validated.data;

  // Attempt to create the user in the database
  try {
    await prisma.user.create({
      data: {
        email,
        hashedPassword: await bcrypt.hash(password, 10),
      },
    });
  } catch (error) {
    console.log(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          message: "Email already in use. Please try again.",
        };
      }
    }
    return {
      message: "Something went wrong. Please try again.",
    };
  }

  // Attempt to sign the user in
  try {
    // signIn automatically redirects if successful
    await signIn("credentials", {
      redirectTo: "/app/dashboard",
      ...validated.data,
    });
  } catch (error) {
    console.log(error);
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            message: "Invalid email or password. Please try again.",
          };
        default:
          return {
            message: "Something went wrong. Please try again.",
          };
      }
    }
    // NextJS redirects by throwing an error...
    // Since we catch it here, we need to rethrow it for the redirect to continue
    throw error;
  }
}

// Authentication -------------------------------------------------------------

export async function logIn(_prevState: unknown, formData: unknown) {
  // Narrow type to verify we're working with FormData
  if (!(formData instanceof FormData)) {
    return {
      message: "Invalid data was provided. Please try again.",
    };
  }

  // Verify that the data matches the Zod schema
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    console.log("Couldn't validate credentials", parsed.error);
    return;
  }

  // Attempt to sign the user in
  try {
    // signIn automatically redirects if successful
    await signIn("credentials", {
      redirectTo: "/app/dashboard",
      ...parsed.data,
    });
  } catch (error) {
    console.log(error);
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            message: "Invalid email or password. Please try again.",
          };
        default:
          return {
            message: "Something went wrong. Please try again.",
          };
      }
    }
    // NextJS redirects by throwing an error...
    // Since we catch it here, we need to rethrow it for the redirect to continue
    throw error;
  }
}

export async function logOut() {
  await signOut({ redirectTo: "/" });
}
