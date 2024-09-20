"use client";

import { addPet, deletePet, editPet } from "@/actions/actions";
import { PetFormValues } from "@/lib/types";
import { TPetFormValues } from "@/lib/validations";
import { Pet } from "@prisma/client";
import React, { createContext, useOptimistic, useState } from "react";
import { toast } from "sonner";

type TPetContext = {
  selectedPetId: Pet["id"] | null;
  handleSetSelectedPetId: (id: Pet["id"]) => void;
  selectedPet: Pet | undefined;
  numberOfPets: number;
  pets: Pet[];
  handleAddPet: (petFormValues: PetFormValues) => Promise<void>;
  handleEditPet: (petFormValues: PetFormValues) => Promise<void>;
  handleDeletePet: (petId: Pet["id"]) => Promise<void>;
};

type PetContextProviderProps = {
  children: React.ReactNode;
  data: Pet[];
};

export const PetContext = createContext<TPetContext | null>(null);

export default function PetContextProvider({
  children,
  data,
}: PetContextProviderProps) {
  const [optimisticPets, setOptimisticPets] = useOptimistic(
    data,
    (state, { action, payload }) => {
      switch (action) {
        case "add":
          return [...state, { ...payload, id: Date.now().toString() }];
        case "edit":
          return state.map((pet) => {
            if (pet.id === payload.id) {
              return { ...pet, ...payload.petFormValues };
            }
            return pet;
          });
        case "delete":
          return state.filter((pet) => pet.id !== payload);
        default:
          return state;
      }
    }
  );
  const [selectedPetId, setSelectedPetId] = useState<Pet["id"] | null>(null);

  const selectedPet = optimisticPets.find((pet) => pet.id === selectedPetId);
  const numberOfPets = optimisticPets.length;

  function handleSetSelectedPetId(id: Pet["id"]) {
    setSelectedPetId(id);
  }

  async function handleAddPet(petFormValues: PetFormValues) {
    setOptimisticPets({ action: "add", payload: petFormValues });

    const error = await addPet(petFormValues);

    if (error) {
      toast.warning(error.message);
      return;
    }
  }

  async function handleEditPet(petFormValues: PetFormValues) {
    if (!selectedPetId) return;

    setOptimisticPets({
      action: "edit",
      payload: { id: selectedPetId, petFormValues },
    });

    const error = await editPet(selectedPetId, petFormValues);
    if (error) {
      toast.warning(error.message);
      return;
    }
  }

  async function handleDeletePet(petId: string) {
    setOptimisticPets({ action: "delete", payload: petId });

    const error = await deletePet(petId);
    if (error) {
      toast.warning(error.message);
      return;
    }

    setSelectedPetId(null);
  }

  return (
    <PetContext.Provider
      value={{
        selectedPetId,
        handleSetSelectedPetId,
        selectedPet,
        numberOfPets,
        pets: optimisticPets,
        handleAddPet,
        handleEditPet,
        handleDeletePet,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}
