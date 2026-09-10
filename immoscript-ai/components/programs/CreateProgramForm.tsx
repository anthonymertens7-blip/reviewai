"use client";

import { useState } from "react";
import { ProgramForm } from "./ProgramForm";

export function CreateProgramForm() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        + Créer un programme
      </button>
    );
  }

  return <ProgramForm mode="create" />;
}
