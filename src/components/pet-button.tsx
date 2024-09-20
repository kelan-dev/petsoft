"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import PetForm from "./pet-form";
import { flushSync } from "react-dom";

type PetButtonProps = {
  children?: React.ReactNode;
  actionType: "add" | "edit" | "checkout";
  onClick?: () => void;
  disabled?: boolean;
};

export default function PetButton({
  children,
  actionType,
  onClick,
  disabled,
}: PetButtonProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (actionType === "checkout") {
    return (
      <Button
        variant="secondary"
        shape="circle"
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </Button>
    );
  }

  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <DialogTrigger asChild>
        {actionType === "add" ? (
          <Button size="icon" shape="circle">
            <PlusIcon className="w-6 h-6" />
          </Button>
        ) : (
          <Button variant="secondary" shape="circle">
            {children}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {actionType === "add" ? "Add a new pet" : "Edit pet"}
          </DialogTitle>
        </DialogHeader>
        <PetForm
          actionType={actionType}
          onFormSubmit={() => flushSync(() => setIsFormOpen(false))}
        />
      </DialogContent>
    </Dialog>
  );
}
