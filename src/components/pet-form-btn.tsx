import React from "react";
import { Button } from "./ui/button";

export default function PetFormBtn({
  actionType,
}: {
  actionType: "add" | "edit";
}) {
  return (
    <Button type="submit" shape="circle" className="mt-5 self-end">
      {actionType === "add" ? "Add Pet" : "Edit Pet"}
    </Button>
  );
}
