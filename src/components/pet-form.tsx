"use client";

import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { usePetContext } from "@/lib/hooks";
import PetFormBtn from "./pet-form-btn";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TPetFormValues, petFormSchema } from "@/lib/validations";
import { toast } from "sonner";

type PetFormProps = {
  actionType: "add" | "edit";
  onFormSubmit: () => void;
};

export default function PetForm({ actionType, onFormSubmit }: PetFormProps) {
  const { selectedPet, handleAddPet, handleEditPet } = usePetContext();

  // RHF will manage the form elements
  const {
    register,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<TPetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues:
      actionType === "add" || !selectedPet
        ? undefined
        : {
            name: selectedPet.name,
            ownerName: selectedPet.ownerName,
            imageUrl: selectedPet.imageUrl,
            age: selectedPet.age,
            notes: selectedPet.notes,
          },
  });

  async function handleFormAction(formData: FormData) {
    // Manually trigger RHF client side validation
    const validated = await trigger();
    if (!validated) return;

    // Parse the form data so that types are inferred
    const parsed = petFormSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      console.log("Couldn't validate pet form", parsed.error);
      toast.error("Couldn't validate pet form");
      return;
    }

    // Notify event listener
    onFormSubmit();

    // Call the appropriate server action
    if (actionType === "add") {
      await handleAddPet(parsed.data);
    } else {
      await handleEditPet(parsed.data);
    }
  }

  return (
    <form action={handleFormAction} className="flex flex-col">
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="ownerName">Owner Name</Label>
          <Input id="ownerName" {...register("ownerName")} />
          {errors.ownerName && (
            <p className="text-red-500">{errors.ownerName.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input id="imageUrl" {...register("imageUrl")} />
          {errors.imageUrl && (
            <p className="text-red-500">{errors.imageUrl.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="age">Age</Label>
          <Input id="age" {...register("age")} />
          {errors.age && <p className="text-red-500">{errors.age.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" {...register("notes")} />
          {errors.notes && (
            <p className="text-red-500">{errors.notes.message}</p>
          )}
        </div>
      </div>
      <PetFormBtn actionType={actionType} />
    </form>
  );
}
